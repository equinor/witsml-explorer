using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Serilog;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Query;

namespace WitsmlExplorer.Api.Services
{
    public interface IMessageObjectService
    {
        Task<MessageObject> GetMessageObject(string wellUid, string wellboreUid, string msgUid);
        Task<IEnumerable<MessageObject>> GetMessageObjects(string wellUid, string wellboreUid);
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
            return messageObject == null ? null : FromWitsml(messageObject);
        }

        public async Task<IEnumerable<MessageObject>> GetMessageObjects(string wellUid, string wellboreUid)
        {
            DateTime start = DateTime.Now;
            WitsmlMessages witsmlMessage = MessageQueries.GetMessageByWellbore(wellUid, wellboreUid);
            WitsmlMessages result = await _witsmlClient.GetFromStoreAsync(witsmlMessage, new OptionsIn(ReturnElements.Requested));
            List<MessageObject> messageObjects = result.Messages
                .Select(FromWitsml).OrderBy((m) => m.DTim).ToList();
            double elapsed = DateTime.Now.Subtract(start).Milliseconds / 1000.0;
            Log.Debug("Fetched {Count} messageobjects from {WellboreName} in {Elapsed} seconds", messageObjects.Count, messageObjects.FirstOrDefault()?.WellboreName, elapsed);
            return messageObjects;
        }

        private static MessageObject FromWitsml(WitsmlMessage message)
        {
            return new MessageObject
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
