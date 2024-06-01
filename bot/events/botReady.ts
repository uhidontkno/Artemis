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
    let statuses = [
      {
        name: "this server",
        type: ActivityType.Watching,
        state: `and ${client.guilds.list.length - 1} other server(s) that support FOSS.`,
      },
      {
        name: "for verifications",
        type: ActivityType.Watching,
        state: ``,
      },
      {
        name: "you",
        type: ActivityType.Watching,
        state: `and ${client.guilds.list.length - 1} other server(s) that support FOSS.`,
      },
      {
        name: "out for alt accounts",
        type: ActivityType.Watching,
        state: "",
      },
      {
        name: `🔗 ${process.env["DEPLOYMENT_URL"]}`,
        type: ActivityType.Custom,
        state: `🔗 ${process.env["DEPLOYMENT_URL"]}`,
      },
    ];
    setInterval(() => {
      // @ts-ignore
      client.gateway.setPresence({
        activities: [statuses[Math.floor(Math.random() * statuses.length)]],
        afk: false,
        since: Date.now(),
        status: PresenceUpdateStatus.DoNotDisturb,
      });
    });
  },
});
