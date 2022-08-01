using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WitsmlExplorer.Api.Query;
using Witsml.ServiceReference;
using WitsmlExplorer.Api.Models;
using WitsmlExplorer.Api.Models.Measure;
using System.Globalization;

namespace WitsmlExplorer.Api.Services
{
    public interface IWbGeometryService
    {
        Task<IEnumerable<WbGeometry>> GetWbGeometrys(string wellUid, string wellboreUid);

    }

    // ReSharper disable once UnusedMember.Global
    public class WbGeometryService : WitsmlService, IWbGeometryService
    {
        public WbGeometryService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<IEnumerable<WbGeometry>> GetWbGeometrys(string wellUid, string wellboreUid)
        {
            var query = WbGeometryQueries.GetWitsmlWbGeometryByWellbore(wellUid, wellboreUid);
            var result = await WitsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.All));

            return result.WbGeometrys.Select(wbGeometry =>
                new WbGeometry
                {
                    WellUid = wbGeometry.UidWell,
                    Uid = wbGeometry.Uid,
                    WellboreUid = wbGeometry.UidWellbore,
                    Name = wbGeometry.Name,
                    WellName = wbGeometry.NameWell,
                    WellboreName = wbGeometry.NameWellbore,
                    DTimReport = StringHelpers.ToDateTime(wbGeometry.DTimReport),
                    MdBottom = (wbGeometry.MdBottom == null) ? null : new MeasuredDepthCoord { Uom = wbGeometry.MdBottom.Uom, Value = double.Parse(wbGeometry.MdBottom.Value, CultureInfo.InvariantCulture) },
                    GapAir = (wbGeometry.GapAir == null) ? null : new LengthMeasure { Uom = wbGeometry.GapAir.Uom, Value = decimal.Parse(wbGeometry.GapAir.Value) },
                    DepthWaterMean = (wbGeometry.DepthWaterMean == null) ? null : new LengthMeasure { Uom = wbGeometry.DepthWaterMean.Uom, Value = decimal.Parse(wbGeometry.DepthWaterMean.Value) },
                    CommonData = new CommonData()
                    {
                        SourceName = wbGeometry.CommonData.SourceName,
                        ItemState = wbGeometry.CommonData.ItemState,
                        Comments = wbGeometry.CommonData.Comments,
                        DTimCreation = StringHelpers.ToDateTime(wbGeometry.CommonData.DTimCreation),
                        DTimLastChange = StringHelpers.ToDateTime(wbGeometry.CommonData.DTimLastChange),
                    }
                }).OrderBy(WbGeometry => WbGeometry.DTimReport);
        }
    }
}
