using System.Collections.Generic;
using System.Linq;

using Witsml.Data;

namespace WitsmlExplorer.Api.Models
{
    public class ReferencePoint
    {
        public string Uid { get; init; }
        public string Name { get; set; }
        public List<Location> Location { get; set; }

        public static ReferencePoint FromWitsmlReferencePoint(WitsmlReferencePoint witsmlReferencePoint)
        {
            return witsmlReferencePoint == null
                ? null
                : new ReferencePoint
                {
                    Uid = witsmlReferencePoint.Uid,
                    Name = witsmlReferencePoint.Name,
                    Location = Models.Location.FromWitsmlLocation(witsmlReferencePoint.Location)
                };
        }

        public static List<ReferencePoint> FromWitsmlReferencePoint(IEnumerable<WitsmlReferencePoint> witsmlReferencePoint)
        {
            return witsmlReferencePoint?.Select(FromWitsmlReferencePoint).ToList() ?? new List<ReferencePoint>();
        }
    }
}
