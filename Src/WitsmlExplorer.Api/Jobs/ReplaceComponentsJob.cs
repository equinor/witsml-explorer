namespace WitsmlExplorer.Api.Jobs
{
    public record ReplaceComponentsJob : Job
    {
        public DeleteComponentsJob DeleteJob { get; init; }
        public CopyComponentsJob CopyJob { get; init; }

        public override string Description()
        {
            return $"{GetType().Name} - {DeleteJob.Description()}\t\n{CopyJob.Description()};";
        }

        public override string GetObjectName()
        {
            return CopyJob.GetObjectName();
        }

        public override string GetWellboreName()
        {
            return CopyJob.GetWellboreName();
        }

        public override string GetWellName()
        {
            return CopyJob.GetWellName();
        }

        /// <summary>
        /// Indicates, if the job can be cancelled
        /// </summary>
        public override bool IsCancelable => true;
    }
}
