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
            var witsmlMessage = MessageQueries.GetMessageById(wellUid, wellboreUid, msgUid);
            var result = await WitsmlClient.GetFromStoreAsync(witsmlMessage, OptionsIn.All);
            var messageObject = result.Messages.FirstOrDefault();
            if (messageObject == null) return null;

            return new MessageObject
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
            var start = DateTime.Now;
            var witsmlMessage = MessageQueries.GetMessageByWellbore(wellUid, wellboreUid);
            var result = await WitsmlClient.GetFromStoreAsync(witsmlMessage, OptionsIn.Requested);

            var messageObjects = result.Messages
                .Select(messageObject =>
                    new MessageObject
                    {
                        Uid = messageObject.Uid,
                        Name = messageObject.Name,
                        WellboreUid = messageObject.UidWellbore,
                        WellboreName = messageObject.NameWellbore,
                        WellUid = messageObject.UidWell,
                        WellName = messageObject.NameWell,
                        MessageText = messageObject.MessageText,
                        DateTimeLastChange = StringHelpers.ToDateTime(messageObject.CommonData.DTimLastChange)
                    })
                .OrderBy(messageObject => messageObject.WellboreName).ToList();
            var elapsed = DateTime.Now.Subtract(start).Milliseconds / 1000.0;
            Log.Debug($"Fetched {messageObjects.Count} messageobjects in {elapsed} seconds from {messageObjects.FirstOrDefault()?.WellName}");
            return messageObjects;
        }
    }
}
