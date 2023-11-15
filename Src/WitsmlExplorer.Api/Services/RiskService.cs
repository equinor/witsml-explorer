using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IRiskService
    {
        Task<ICollection<Risk>> GetRisks(string wellUid, string wellboreUid);
    }

    public class RiskService : WitsmlService, IRiskService
    {
        public RiskService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<ICollection<Risk>> GetRisks(string wellUid, string wellboreUid)
        {
            WitsmlRisks query = RiskQueries.GetWitsmlRiskByWellbore(wellUid, wellboreUid);
            WitsmlRisks result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));

            return result.Risks.Select(risk =>

                new Risk
                {
                    Name = risk.Name,
                    WellboreName = risk.NameWellbore,
                    WellboreUid = risk.UidWellbore,
                    WellName = risk.NameWell,
                    WellUid = risk.UidWell,
                    Uid = risk.Uid,
                    Type = risk.Type,
                    Category = risk.Category,
                    SubCategory = risk.SubCategory,
                    ExtendCategory = risk.ExtendCategory,
                    AffectedPersonnel = (risk.AffectedPersonnel != null) ? string.Join(", ", risk.AffectedPersonnel) : "",
                    DTimStart = risk.DTimStart,
                    DTimEnd = risk.DTimEnd,
                    MdBitStart = (risk.MdBitStart == null) ? null : new MeasureWithDatum { Uom = risk.MdBitStart.Uom, Value = StringHelpers.ToDouble(risk.MdBitStart.Value) },
                    MdBitEnd = (risk.MdBitEnd == null) ? null : new MeasureWithDatum { Uom = risk.MdBitEnd.Uom, Value = StringHelpers.ToDouble(risk.MdBitEnd.Value) },
                    SeverityLevel = risk.SeverityLevel,
                    ProbabilityLevel = risk.ProbabilityLevel,
                    Summary = risk.Summary,
                    Details = risk.Details,
                    CommonData = new CommonData()
                    {
                        ItemState = risk.CommonData.ItemState,
                        SourceName = risk.CommonData.SourceName,
                        DTimLastChange = risk.CommonData.DTimLastChange,
                        DTimCreation = risk.CommonData.DTimCreation,
                    }
                }).OrderBy(risk => risk.Name).ToList();
        }
    }
}
