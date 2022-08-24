using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Serilog;

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
            Witsml.Data.WitsmlMessages witsmlMessage = MessageQueries.GetMessageById(wellUid, wellboreUid, msgUid);
            Witsml.Data.WitsmlMessages result = await _witsmlClient.GetFromStoreAsync(witsmlMessage, new OptionsIn(ReturnElements.All));
            Witsml.Data.WitsmlMessage messageObject = result.Messages.FirstOrDefault();
            return messageObject == null
                ? null
                : new MessageObject
                {
                    WellboreUid = messageObject.UidWellbore,
                    WellboreName = messageObject.NameWellbore,
                    WellUid = messageObject.UidWell,
                    WellName = messageObject.NameWell,
                    Uid = messageObject.Uid,
                    Name = messageObject.Name,
                    MessageText = messageObject.MessageText,
                    DateTimeCreation = StringHelpers.ToDateTime(messageObject.CommonData.DTimCreation),
                    DateTimeLastChange = StringHelpers.ToDateTime(messageObject.CommonData.DTimLastChange)
                };
        }

        public async Task<IEnumerable<MessageObject>> GetMessageObjects(string wellUid, string wellboreUid)
        {
            DateTime start = DateTime.Now;
            Witsml.Data.WitsmlMessages witsmlMessage = MessageQueries.GetMessageByWellbore(wellUid, wellboreUid);
            Witsml.Data.WitsmlMessages result = await _witsmlClient.GetFromStoreAsync(witsmlMessage, new OptionsIn(ReturnElements.Requested));
            List<MessageObject> messageObjects = result.Messages
                .Select(message =>
                    new MessageObject
                    {
                        Uid = message.Uid,
                        Name = message.Name,
                        WellboreUid = message.UidWellbore,
                        WellboreName = message.NameWellbore,
                        WellUid = message.UidWell,
                        WellName = message.NameWell,
                        MessageText = message.MessageText,
                        DateTimeLastChange = StringHelpers.ToDateTime(message.CommonData.DTimLastChange),
                        DateTimeCreation = StringHelpers.ToDateTime(message.CommonData.DTimCreation)
                    })
                .OrderBy(message => message.WellboreName).ToList();
            double elapsed = DateTime.Now.Subtract(start).Milliseconds / 1000.0;
            Log.Debug("Fetched {Count} messageobjects from {WellboreName} in {Elapsed} seconds", messageObjects.Count, messageObjects.FirstOrDefault()?.WellboreName, elapsed);
            return messageObjects;
        }
    }
}
