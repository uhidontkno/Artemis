import {
  Declare,
  Command,
  type CommandContext,
  Options,
  createRoleOption,
  Embed,
  ActionRow,
  Button,
  ButtonInteraction,
  createStringOption,
  createChannelOption,
} from "seyfert";
import { dbopen, dbwrite, dbread } from "../../components/sqllite";
import { EmbedColors } from "seyfert/lib/common";
import {
  ButtonStyle,
  ChannelFlags,
  ChannelType,
  MessageFlags,
} from "seyfert/lib/types";
import { encryptData } from "../../components/helper";

@Options({
  verifyrole: createRoleOption({
    description: "Role to give users when they verify.",
    required: true,
  }),
  loggingchannel: createChannelOption({
    description: "Channel to log verifications",
    channel_types: [ChannelType.GuildText, ChannelType.PrivateThread],
    required: true,
  }),
  actiononfail: createStringOption({
    description: "Action to take when the user fails to verify. (Default: nothing, recommended: 0,1, or 2)",
    choices: [
      { name: "Do Nothing [0]", value: "nothing" },
      { name: "Kick [1]", value: "kick" },
      { name: "Mute (15m) [2]", value: "mute.15" },
      { name: "Mute (1h) [3]", value: "mute.60" },
      { name: "Mute (3h) [4]", value: "mute.180" },
      { name: "Ban [5]", value: "ban" },
    ],
    required: false,
  }),
  minimumaccountage: createStringOption({
    description: "Minimum account age to verify. (Default: 3 days, recommended: 1 week)",
    choices: [
      { name: "1 Hour  ", value: "1" },
      { name: "6 Hours ", value: "6" },
      { name: "1 Day   ", value: "24" },
      { name: "3 Days  ", value: "72" },
      { name: "1 Week  ", value: "168" },
      { name: "2 Weeks ", value: "336" },
    ],
    required: false,
  }),
})
@Declare({
  name: "setup",
  description: "Setup this server with Artemis.",
})
export default class SetupServerCommand extends Command {
  async run(ctx: CommandContext) {
    if (
      !ctx.member?.permissions.has(ctx.member?.permissions.Flags.Administrator)
    ) {
      await ctx.editOrReply({
        content: "You need the `Administrator` permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await ctx.deferReply();
    let db = dbopen("db.sql");
    if (dbread(db, "config", ctx.guildId || "-1")) {
      let em = new Embed({
        title: "Question",
        color: EmbedColors.Blurple,
        description:
          "A configuration for this server has been detected. Do you want to overwrite it?",
      });
      // buttons
      const confirm = new Button()
        .setCustomId("confirm")
        .setStyle(ButtonStyle.Danger)
        .setLabel("Yes");
      const cancel = new Button()
        .setCustomId("cancel")
        .setStyle(ButtonStyle.Secondary)
        .setLabel("No");
      const row = new ActionRow<Button>().setComponents([cancel, confirm]);

      let m = await ctx.editOrReply({ embeds: [em], components: [row] });
      // @ts-expect-error
      const collector = m.createComponentCollector();
      collector.run("confirm", async (i: ButtonInteraction) => {
        if (!i.isButton()) {
          return;
        }
        if (i.user.id != ctx.author.id) {
          return i.write({
            content: "This is **not** your button.",

            flags: MessageFlags.Ephemeral,
          });
        }

        let em = new Embed({
          title: "Success",
          color: EmbedColors.Green,
          description: "Set configuration for this server.",
        });

        dbwrite(
          db,
          "config",
          ctx.guildId || "-1",

          encryptData(
            JSON.stringify({
              // @ts-expect-error
              verifyrole: ctx.options.verifyrole.id,
              // @ts-expect-error
              actiononfail: ctx.options.actiononfail || "nothing",
              // @ts-expect-error
              loggingchannel: ctx.options.loggingchannel.id,
              // @ts-expect-error
              minimumaccountage: ctx.options.minimumaccountage || "72",
            }),
            String(ctx.guildId),
          ),
        );
        await ctx.editOrReply({ embeds: [em], components: [] });
      });
      collector.run("cancel", async (i: ButtonInteraction) => {
        if (!i.isButton()) {
          return;
        }
        if (i.user.id != ctx.author.id) {
          return await i.write({
            content: "This is **not** your button.",
            flags: MessageFlags.Ephemeral,
          });
        }

        await ctx.editOrReply({
          content: "Cancelled.",
          flags: MessageFlags.Ephemeral,
          embeds: [],
          components: [],
        });
      });
    } else {
      let em = new Embed({
        title: "Success",
        color: EmbedColors.Green,
        description: "Set configuration for this server.",
      });

      dbwrite(
        db,
        "config",
        ctx.guildId || "-1",

        encryptData(
          JSON.stringify({
            // @ts-expect-error
            verifyrole: ctx.options.verifyrole.id,
            // @ts-expect-error
            actiononfail: ctx.options.actiononfail || "nothing",
            // @ts-expect-error
            loggingchannel: ctx.options.loggingchannel.id,
          }),
          String(ctx.guildId),
        ),
      );
      await ctx.editOrReply({ embeds: [em], components: [] });
    }
  }
}
