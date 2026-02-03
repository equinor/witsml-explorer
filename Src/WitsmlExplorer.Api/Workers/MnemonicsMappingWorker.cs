using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

using Microsoft.Extensions.Logging;

using WitsmlExplorer.Api.Extensions;
using WitsmlExplorer.Api.Jobs;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Repositories;
using WitsmlExplorer.Api.Services;

namespace WitsmlExplorer.Api.Workers
{
    public class MnemonicsMappingWorker : BaseWorker<MnemonicsMappingJob>, IWorker
    {
        public JobType JobType => JobType.MnemonicsMapping;

        private readonly IDocumentRepository<MnemonicsMapping, Guid> _mnemonicsMappingRepository;

        public MnemonicsMappingWorker(ILogger<MnemonicsMappingJob> logger, IWitsmlClientProvider witsmlClientProvider, IDocumentRepository<MnemonicsMapping, Guid> mnemonicsMappingRepository) : base(witsmlClientProvider, logger)
        {
            _mnemonicsMappingRepository = mnemonicsMappingRepository;
        }

        public override async Task<(WorkerResult WorkerResult, RefreshAction RefreshAction)> Execute(MnemonicsMappingJob job, CancellationToken? cancellationToken = null)
        {
            var jobValidationMessage = JobValidation(job);

            if (!jobValidationMessage.IsNullOrEmpty())
            {
                return GetFailedWorkerResult(jobValidationMessage);
            }

            var newMappings = job.Mappings
                .Skip(1)
                .Where(m => m.Count == 2 && !m[0].IsNullOrEmpty() && !m[1].IsNullOrEmpty())
                .GroupBy(i => i[0]);

            if (cancellationToken is { IsCancellationRequested: true })
            {
                return GetCancellationWorkerResult();
            }

            var foundMappings = await _mnemonicsMappingRepository.GetDocumentsAsync(mm => mm.VendorName == job.VendorName);

            if (cancellationToken is { IsCancellationRequested: true })
            {
                return GetCancellationWorkerResult();
            }

            if (!foundMappings.IsNullOrEmpty())
            {
                if (job.Overwrite)
                {
                    await ReplaceDocuments(job.VendorName, newMappings);
                }
                else
                {
                    await UpsertDocuments(job.VendorName, newMappings, foundMappings, cancellationToken);
                }

                if (cancellationToken is { IsCancellationRequested: true })
                {
                    return GetCancellationWorkerResult();
                }
            }
            else
            {
                await InsertDocuments(job.VendorName, newMappings);
            }

            WorkerResult workerResult = new(GetTargetWitsmlClientOrThrow().GetServerHostname(), true, (job.Overwrite ? "Replaced" : "Added") + $" mnemonics' mappings for vendor: {job.VendorName}", jobId: job.JobInfo.Id);
            return new(workerResult, null);
        }

        private async Task InsertDocuments(string vendorName, IEnumerable<IGrouping<string, IList<string>>> newMappings)
        {
            await _mnemonicsMappingRepository.CreateDocumentsAsync(
                newMappings.Select(g => new MnemonicsMapping(Guid.NewGuid())
                {
                    VendorName = vendorName,
                    GlobalMnemonicName = g.Key,
                    VendorMnemonicNames = g.Select(i => i[1]).Distinct().ToList()
                }).ToList());
        }

        private async Task UpsertDocuments(string vendorName, IEnumerable<IGrouping<string, IList<string>>> newMappings, ICollection<MnemonicsMapping> foundMappings, CancellationToken? cancellationToken)
        {
            var documentsToUpdate = new List<MnemonicsMapping>();
            var documentsToInsert = new List<MnemonicsMapping>();

            foreach (var mapping in newMappings)
            {
                var foundMapping = foundMappings.FirstOrDefault(fm => fm.GlobalMnemonicName == mapping.Key);

                if (foundMapping != null)
                {
                    var newVendorMnemonicNames = mapping.Select(i => i[1])
                        .Concat(foundMapping.VendorMnemonicNames)
                        .Distinct()
                        .ToList();

                    documentsToUpdate.Add(new MnemonicsMapping(foundMapping.Id)
                    {
                        VendorName = vendorName,
                        GlobalMnemonicName = mapping.Key,
                        VendorMnemonicNames = newVendorMnemonicNames
                    });
                }
                else
                {
                    documentsToInsert.Add(new MnemonicsMapping(Guid.NewGuid())
                    {
                        VendorName = vendorName,
                        GlobalMnemonicName = mapping.Key,
                        VendorMnemonicNames = mapping.Select(i => i[1]).Distinct().ToList()
                    });
                }

                if (cancellationToken is { IsCancellationRequested: true })
                {
                    return;
                }
            }

            if (documentsToUpdate.Any())
            {
                await _mnemonicsMappingRepository.UpdateDocumentsAsync(documentsToUpdate);
            }

            if (documentsToInsert.Any())
            {
                await _mnemonicsMappingRepository.CreateDocumentsAsync(documentsToInsert);
            }
        }

        private async Task ReplaceDocuments(string vendorName, IEnumerable<IGrouping<string, IList<string>>> newMappings)
        {
            await _mnemonicsMappingRepository.DeleteDocumentsAsync(m => m.VendorName == vendorName);
            await InsertDocuments(vendorName, newMappings);
        }

        private string JobValidation(MnemonicsMappingJob job)
        {
            var sb = new StringBuilder("");

            if (job.Mappings.Count < 2)
            {
                sb.AppendLine("Job contains no data");
            }
            else
            {
                var header = job.Mappings.First();

                if (header[0] != "Vendor Mnemonic")
                {
                    sb.AppendLine("First column doesn't contain \"Vendor Mnemonic\" header value.");
                }

                if (header[1] != "Global Mnemonic")
                {
                    sb.AppendLine("Second column doesn't contain \"Global Mnemonic\" header value.");
                }
            }

            return sb.ToString().TrimEnd();
        }

        private (WorkerResult WorkerResult, RefreshAction RefreshAction) GetCancellationWorkerResult()
        {
            Logger.LogInformation(CancellationMessage());
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, CancellationMessage(), CancellationReason()), null);
        }

        private (WorkerResult WorkerResult, RefreshAction RefreshAction) GetFailedWorkerResult(string message)
        {
            Logger.LogInformation(message);
            return (new WorkerResult(GetTargetWitsmlClientOrThrow().GetServerHostname(), false, message), null);
        }
    }
}
