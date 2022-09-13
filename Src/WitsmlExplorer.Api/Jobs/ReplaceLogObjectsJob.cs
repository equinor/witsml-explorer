namespace WitsmlExplorer.Api.Jobs
{
    public record ReplaceLogObjectsJob : Job
    {
        public DeleteLogObjectsJob DeleteJob { get; init; }
        public CopyLogJob CopyJob { get; init; }

        public override string Description()
        {
            return $"{GetType().Name} - {DeleteJob.Description()}\t\n{CopyJob.Description()};";
        }
    }
}
