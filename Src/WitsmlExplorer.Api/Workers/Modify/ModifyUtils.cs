using System;

using WitsmlExplorer.Api.Models.Measure;

namespace WitsmlExplorer.Api.Workers.Modify
{
    public class ModifyUtils
    {
        public static void VerifyMeasure(Measure measure, string name)
        {
            if (measure == null)
            {
                return;
            }
            if (string.IsNullOrEmpty(measure.Uom))
            {
                throw new InvalidOperationException($"unit of measure for {name} cannot be empty");
            }
        }
    }
}
