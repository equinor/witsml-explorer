using System.Collections.Generic;

namespace WitsmlExplorer.Api.Models
{
    public class MissingDataCheck
    {
        public EntityType ObjectType { get; set; }
        public IEnumerable<string> Properties { get; set; }
    }
}
