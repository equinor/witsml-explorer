using System.Threading.Tasks;

using Microsoft.AspNetCore.SignalR;

namespace WitsmlExplorer.Api.Services
{
    public class NotificationsHub : Hub
    {
        public async Task JoinJobProgressGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "jobProgress");
        }

        public async Task LeaveJobProgressGroup()
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, "jobProgress");
        }
    }
}
