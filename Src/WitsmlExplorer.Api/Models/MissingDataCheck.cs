using System.Collections.Generic;

namespace WitsmlExplorer.Api.Models
{
    public class MissingDataCheck
    {
        public EntityType ObjectType { get; set; }
        public ICollection<string> Properties { get; set; }
    }
}
