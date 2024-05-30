import { createEvent } from "seyfert";
import logger from "../../components/logger.ts";
import { PresenceUpdateStatus } from "seyfert/lib/types/index";
import { ActivityType } from "seyfert/lib/types/index";
export default createEvent({
  data: { once: true, name: "botReady" },
  run(user, client) {
    logger.info(
      `${user.username}${user.username == "Artemis" ? "" : " (Artemis instance)"} is ready`,
    );
    // @ts-ignore
    client.gateway.setPresence({
      activities: [
        {
          name: "this server",
          type: ActivityType.Watching,
          state: `and ${client.guilds.list.length - 1} other server(s) that support FOSS.`,
        },
      ],
      afk: false,
      since: Date.now(),
      status: PresenceUpdateStatus.DoNotDisturb,
    });
  },
});
