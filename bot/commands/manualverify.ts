import {
  Declare,
  Command,
  type CommandContext,
  createUserOption,
  Options,
  Embed,
} from "seyfert";
import { MessageFlags } from "seyfert/lib/types";
import { dbopen, dbread } from "../../components/sqllite";
import { EmbedColors } from "seyfert/lib/common";
import { decryptData } from "../../components/helper";
@Declare({
  name: "manualverify",
  description: "Manually verify a user",
})
@Options({
  user: createUserOption({
    description: "User to manually verify.",
    required: true,
  }),
})
export default class ManualVerifyCommand extends Command {
  async run(ctx: CommandContext) {
    if (
      !ctx.member?.permissions.has(
        ctx.member?.permissions.Flags.ModerateMembers,
      )
    ) {
      await ctx.editOrReply({
        content:
          "You need the `Moderate Members` permission to use this command.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    // @ts-expect-error
    if (ctx.options.user.bot) {
      let em = new Embed({
        title: "Error",
        color: EmbedColors.Red,
        description: "Cannot manually verify a bot.",
      });
      await ctx.editOrReply({ embeds: [em] });
      return;
    }

    await ctx.deferReply();
    let db = dbopen("db.sql");
    if (!dbread(db, "config", ctx.guildId || "-1")) {
      let em = new Embed({
        title: "Error",
        color: EmbedColors.Red,
        description:
          "This server has not been setup yet. Please run the `/setup` command.",
      });
      await ctx.editOrReply({ embeds: [em] });
      return;
    }

    let roleId = JSON.parse(
      // @ts-expect-error
      decryptData(dbread(db, "config", ctx.guildId || "-1").value),
    ).verifyrole;
    // @ts-expect-error
    if (ctx.options.user.roles.keys.includes(roleId)) {
      let em = new Embed({
        title: "Error",
        color: EmbedColors.Red,
        description: "User already has the verified role.",
      });
      await ctx.editOrReply({ embeds: [em] });
      return;
    }
    // @ts-expect-error
    await ctx.options.user.roles.add(roleId);
    let em = new Embed({
      title: "Success",
      color: EmbedColors.Green,
      // @ts-expect-error
      description: `Gave user <@${ctx.options.user.id}> (\`${ctx.options.user.username}\`) role <@&${roleId}>`,
    });
    ctx.editOrReply({ embeds: [em] });
  }
}
