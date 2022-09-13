namespace WitsmlExplorer.Api.Jobs
{
    public record ReplaceLogDataJob : Job
    {
        public DeleteMnemonicsJob DeleteJob { get; init; }
        public CopyLogDataJob CopyJob { get; init; }

        public override string Description()
        {
            return $"{GetType().Name} - {DeleteJob.Description()}\t\n{CopyJob.Description()};";
        }
    }
}
