import { Declare, Command, type CommandContext, Embed,User,GuildMember } from "seyfert";
import { EmbedColors } from "seyfert/lib/common";
import { dbopen,dbread } from "../../components/sqllite";
@Declare({
  name: "verify",
  description: "Verify yourself",
})
export default class VerifyCommand extends Command {
  async run(ctx: CommandContext) {
    
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
      atob(dbread(db, "config", ctx.guildId || "-1").value),
    ).verifyrole;
    let user = ctx.member
    if (user.roles.keys.includes(roleId)) {
      let em = new Embed({
        title: "Error",
        color: EmbedColors.Red,
        description: "User already has the verified role.",
      });
      await ctx.editOrReply({ embeds: [em] });
      return;
    }
  }
}
