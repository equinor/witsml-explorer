using System.Collections.Generic;
using System.Xml.Serialization;

using Witsml.Data.Measures;

namespace Witsml.Data.MudLog
{
    public class WitsmlMudLogLithology
    {
        [XmlAttribute("uid")]
        public string Uid { get; set; }

        [XmlElement("type")]
        public string Type { get; set; }

        [XmlElement("codeLith")]
        public string CodeLith { get; set; }

        [XmlElement("lithPc")]
        public WitsmlIndex LithPc { get; set; }

        [XmlElement("description")]
        public string Description { get; set; }

        /// <summary>
        /// Deprecated as of WITSML version 1.4.1"
        /// </summary>
        [XmlElement("lithClass")]
        public string LithClass { get; set; }

        /// <summary>
        /// Deprecated as of WITSML version 1.4.1"
        /// </summary>
        [XmlElement("grainType")]
        public string GrainType { get; set; }

        /// <summary>
        /// Deprecated as of WITSML version 1.4.1"
        /// </summary>
        [XmlElement("dunhamClass")]
        public string DunhamClass { get; set; }

        [XmlElement("color")]
        public string Color { get; set; }

        [XmlElement("texture")]
        public string Texture { get; set; }

        [XmlElement("hardness")]
        public string Hardness { get; set; }

        [XmlElement("compaction")]
        public string Compaction { get; set; }

        [XmlElement("sizeGrain")]
        public string SizeGrain { get; set; }

        [XmlElement("roundness")]
        public string Roundness { get; set; }

        [XmlElement("sphericity")]
        public string Sphericity { get; set; }

        [XmlElement("sorting")]
        public string Sorting { get; set; }

        [XmlElement("matrixCement")]
        public string MatrixCement { get; set; }

        [XmlElement("porosityVisible")]
        public string PorosityVisible { get; set; }

        [XmlElement("porosityFabric")]
        public string PorosityFabric { get; set; }

        [XmlElement("permeability")]
        public string Permeability { get; set; }

        /// <summary>
        /// Deprecated as of WITSML version 1.4.1"
        /// </summary>
        [XmlElement("densShale")]
        public Measure DensShale { get; set; }

        [XmlElement("qualifier")]
        public List<WitsmlQualifier> Qualifier { get; set; }

    }
}
