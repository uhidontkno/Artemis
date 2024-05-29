import { Declare, Command, type CommandContext } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';
import { dbopen,dbread } from '../../components/sqllite';
@Declare({
  name: 'manualverify',
  description: 'Show the ping with discord'
})
export default class ManualVerifyCommand extends Command {

  async run(ctx: CommandContext) {
    if (!ctx.member?.permissions.has(ctx.member?.permissions.Flags.ModerateMembers)) {
        await ctx.editOrReply({"content":"You need the `Moderate Members` permission to use this command.",flags:MessageFlags.Ephemeral})
        return;
    }
    await ctx.deferReply();
    let db = dbopen("db.sql")
    if (!dbread(db,"config",(ctx.guildId || "-1"))) {
        await ctx.editOrReply({"content":"This server has not been setup yet. Please run the `/setup` command."})
        return;
    }
  }
}