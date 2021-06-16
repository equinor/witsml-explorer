using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Serilog;
using Witsml.Data;
using Witsml.Extensions;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Models;

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
            var query = CreateMessageQuery(wellUid, wellboreUid, msgUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, OptionsIn.All);
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
            var query = CreateMessageQuery(wellUid, wellboreUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, OptionsIn.All);
            var messageObject = result.Messages.FirstOrDefault();
            if (messageObject == null) return null;

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
            Log.Debug($"Fetched {messageObjects.Count} messageobjects in {elapsed} seconds");
            return messageObjects;
        }

        private static WitsmlMessages CreateMessageQuery(string wellUid, string wellboreUid, string messageUid)
        {
            return new()
            {
                Messages = new WitsmlMessage
                {
                    UidWellbore = wellboreUid,
                    UidWell = wellUid,
                    Uid = messageUid,
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }

        private static WitsmlMessages CreateMessageQuery(string wellUid, string wellboreUid)
        {
            return new()
            {
                Messages = new WitsmlMessage
                {
                    UidWellbore = wellboreUid,
                    UidWell = wellUid,
                    CommonData = new WitsmlCommonData()
                }.AsSingletonList()
            };
        }
    }
}
