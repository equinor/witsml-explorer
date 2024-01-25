using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.Helpers;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IMessageObjectService
    {
        Task<MessageObject> GetMessageObject(string wellUid, string wellboreUid, string msgUid);
        Task<ICollection<MessageObject>> GetMessageObjects(string wellUid, string wellboreUid);
    }

    public class MessageObjectService : WitsmlService, IMessageObjectService
    {
        public MessageObjectService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider)
        {
        }

        public async Task<MessageObject> GetMessageObject(string wellUid, string wellboreUid, string msgUid)
        {
            WitsmlMessages witsmlMessage = MessageQueries.GetMessageById(wellUid, wellboreUid, msgUid);
            WitsmlMessages result = await _witsmlClient.GetFromStoreAsync(witsmlMessage, new OptionsIn(ReturnElements.All));
            WitsmlMessage messageObject = result.Messages.FirstOrDefault();
            return FromWitsml(messageObject);
        }

        public async Task<ICollection<MessageObject>> GetMessageObjects(string wellUid, string wellboreUid)
        {
            return await MeasurementHelper.MeasureExecutionTimeAsync(async (timeMeasurer) =>
            {
                WitsmlMessages witsmlMessage = MessageQueries.GetMessageByWellbore(wellUid, wellboreUid);
                WitsmlMessages result = await _witsmlClient.GetFromStoreAsync(witsmlMessage, new OptionsIn(ReturnElements.Requested));
                List<MessageObject> messageObjects = result.Messages
                    .Select(FromWitsml).OrderBy((m) => m.DTim).ToList();
                timeMeasurer.LogMessage = executionTime =>
                    $"Fetched {messageObjects.Count} messageObjects from {messageObjects.FirstOrDefault()?.WellboreName} in {executionTime}ms.";
                return messageObjects;
            });
        }

        private static MessageObject FromWitsml(WitsmlMessage message)
        {
            return message == null ? null : new MessageObject
            {
                WellboreUid = message.UidWellbore,
                WellboreName = message.NameWellbore,
                WellUid = message.UidWell,
                WellName = message.NameWell,
                Uid = message.Uid,
                Name = message.Name,
                MessageText = message.MessageText,
                TypeMessage = message.TypeMessage,
                DTim = message.DTim,
                CommonData = new()
                {
                    SourceName = message.CommonData.SourceName,
                    Comments = message.CommonData.Comments,
                    DTimCreation = message.CommonData.DTimCreation,
                    DTimLastChange = message.CommonData.DTimLastChange
                }
            };
        }
    }
}
