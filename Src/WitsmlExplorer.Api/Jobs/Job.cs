using System.Text.Json.Serialization;

namespace WitsmlExplorer.Api.Jobs
{
    public abstract record Job : IJsonOnDeserialized
    {

        public Job()
        {
            JobInfo = new JobInfo();
        }

        public abstract string Description();

        public void OnDeserialized()
        {
            JobInfo.Description = Description();
            JobInfo.JobType = GetType().Name;
        }

        public JobInfo JobInfo { get; init; }

    }
}
