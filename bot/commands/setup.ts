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
} from "seyfert";
import { dbopen, dbwrite, dbread } from "../../components/sqllite";
import { EmbedColors } from "seyfert/lib/common";
import { ButtonStyle, MessageFlags } from "seyfert/lib/types";
import { PermissionsBitField } from "seyfert/lib/structures/extra/Permissions";

@Options({
  verifyrole: createRoleOption({
    description: "Role to give users when they verify.",
    required: true,
  }),
  actiononfail: createStringOption({
    description: "Action to take when the user fails to verify",
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
          
          btoa(
            JSON.stringify({
              // @ts-expect-error
              verifyrole: ctx.options.verifyrole.id,
              // @ts-expect-error
              actiononfail: ctx.options.actiononfail || "nothing",
            }),
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
        
        btoa(
          JSON.stringify({
            // @ts-expect-error
            verifyrole: ctx.options.verifyrole.id,
            // @ts-expect-error
            actiononfail: ctx.options.actiononfail || "nothing",
          }),
        ),
      );
      await ctx.editOrReply({ embeds: [em], components: [] });
    }
  }
}
