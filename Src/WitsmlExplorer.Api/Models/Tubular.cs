using System;
using System.Collections.Generic;

// ReSharper disable UnusedAutoPropertyAccessor.Global

namespace WitsmlExplorer.Api.Models
{
    public class Tubular
    {
        public string Uid { get; internal set; }
        public string Name { get; internal set; }
        public string WellUid { get; internal set; }
        public string WellboreUid { get; internal set; }
        public string TypeTubularAssy { get; internal set; }
    }
}
