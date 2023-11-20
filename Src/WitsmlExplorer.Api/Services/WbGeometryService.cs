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
    public interface IWbGeometryService
    {
        Task<ICollection<WbGeometry>> GetWbGeometrys(string wellUid, string wellboreUid);
        Task<WbGeometry> GetWbGeometry(string wellUid, string wellboreUid, string wbGeometryUid);
        Task<List<WbGeometrySection>> GetWbGeometrySections(string wellUid, string wellboreUid, string wbGeometryUid);
    }

    // ReSharper disable once UnusedMember.Global
    public class WbGeometryService : WitsmlService, IWbGeometryService
    {
        public WbGeometryService(IWitsmlClientProvider witsmlClientProvider) : base(witsmlClientProvider) { }

        public async Task<WbGeometry> GetWbGeometry(string wellUid, string wellboreUid, string wbGeometryUid)
        {
            WitsmlWbGeometrys query = WbGeometryQueries.GetWitsmlWbGeometryById(wellUid, wellboreUid, wbGeometryUid);
            WitsmlWbGeometrys result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));

            return FromWitsml(result.WbGeometrys.FirstOrDefault());
        }

        public async Task<ICollection<WbGeometry>> GetWbGeometrys(string wellUid, string wellboreUid)
        {
            WitsmlWbGeometrys query = WbGeometryQueries.GetWitsmlWbGeometryByWellbore(wellUid, wellboreUid);
            WitsmlWbGeometrys result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));

            return result.WbGeometrys.Select(FromWitsml).OrderBy(wbGeometry => wbGeometry.DTimReport).ToList();
        }

        private static WbGeometry FromWitsml(WitsmlWbGeometry wbGeometry)
        {
            return wbGeometry == null ? null : new WbGeometry
            {
                WellUid = wbGeometry.UidWell,
                Uid = wbGeometry.Uid,
                WellboreUid = wbGeometry.UidWellbore,
                Name = wbGeometry.Name,
                WellName = wbGeometry.NameWell,
                WellboreName = wbGeometry.NameWellbore,
                DTimReport = wbGeometry.DTimReport,
                MdBottom = MeasureWithDatum.FromWitsml(wbGeometry.MdBottom),
                GapAir = LengthMeasure.FromWitsml(wbGeometry.GapAir),
                DepthWaterMean = LengthMeasure.FromWitsml(wbGeometry.DepthWaterMean),
                CommonData = new CommonData()
                {
                    SourceName = wbGeometry.CommonData.SourceName,
                    ItemState = wbGeometry.CommonData.ItemState,
                    Comments = wbGeometry.CommonData.Comments,
                    DTimCreation = wbGeometry.CommonData.DTimCreation,
                    DTimLastChange = wbGeometry.CommonData.DTimLastChange,
                }
            };
        }

        public async Task<List<WbGeometrySection>> GetWbGeometrySections(string wellUid, string wellboreUid, string wbGeometryUid)
        {
            WitsmlWbGeometrys query = WbGeometryQueries.GetSectionsByWbGeometryId(wellUid, wellboreUid, wbGeometryUid);
            WitsmlWbGeometrys result = await _witsmlClient.GetFromStoreAsync(query, new OptionsIn(ReturnElements.Requested));
            WitsmlWbGeometry witsmlWbGeometry = result.WbGeometrys.FirstOrDefault();
            return witsmlWbGeometry?.WbGeometrySections.Select(section => new WbGeometrySection
            {
                Uid = section.Uid,
                TypeHoleCasing = section.TypeHoleCasing,
                MdTop = MeasureWithDatum.FromWitsml(section.MdTop),
                MdBottom = MeasureWithDatum.FromWitsml(section.MdBottom),
                TvdTop = MeasureWithDatum.FromWitsml(section.TvdTop),
                TvdBottom = MeasureWithDatum.FromWitsml(section.TvdBottom),
                IdSection = LengthMeasure.FromWitsml(section.IdSection),
                OdSection = LengthMeasure.FromWitsml(section.OdSection),
                WtPerLen = LengthMeasure.FromWitsml(section.WtPerLen),
                Grade = section.Grade,
                CurveConductor = StringHelpers.ToBoolean(section.CurveConductor),
                DiaDrift = LengthMeasure.FromWitsml(section.DiaDrift),
                FactFric = string.IsNullOrEmpty(section.FactFric) ? null : StringHelpers.ToDouble(section.FactFric)
            }).ToList();
        }
    }
}
