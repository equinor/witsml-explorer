using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Witsml.Data;
using Witsml.ServiceReference;

using WitsmlExplorer.Api.Models;

namespace WitsmlExplorer.Api.Services
{
    public interface IChangeLogService
    {
        Task<ICollection<ChangeLog>> GetChangeLogs(string wellUid, string wellboreUid);
    }

    public class ChangeLogService : WitsmlService, IChangeLogService
    {
        public ChangeLogService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<ICollection<ChangeLog>> GetChangeLogs(string wellUid, string wellboreUid)
        {
            WitsmlChangeLogs witsmlChangeLog = new WitsmlChangeLog()
            {
                UidWell = wellUid,
                UidWellbore = wellboreUid,
                UidObject = "",
                NameObject = "",
                ObjectType = "",
                LastChangeType = "",
                CommonData = new()
                {
                    DTimLastChange = "",
                    DTimCreation = ""
                }
            }.AsSingletonWitsmlList();
            WitsmlChangeLogs result = await _witsmlClient.GetFromStoreAsync(witsmlChangeLog, new OptionsIn(ReturnElements.Requested));
            return result.ChangeLogs.Select(WitsmlToChangeLog).ToList();
        }

        private static ChangeLog WitsmlToChangeLog(WitsmlChangeLog changeLog)
        {
            return new ChangeLog
            {
                Uid = changeLog.UidObject,
                WellboreUid = changeLog.UidWellbore,
                WellUid = changeLog.UidWell,
                Name = $"{changeLog.ObjectType} {changeLog.NameObject}",
                UidObject = changeLog.UidObject,
                NameObject = changeLog.NameObject,
                LastChangeType = changeLog.LastChangeType,
                CommonData = new()
                {
                    DTimLastChange = changeLog.CommonData.DTimLastChange,
                    DTimCreation = changeLog.CommonData.DTimCreation
                }
            };
        }
    }
}
