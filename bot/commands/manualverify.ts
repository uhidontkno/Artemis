import { Declare, Command, type CommandContext, createUserOption,Options,Embed } from 'seyfert';
import { MessageFlags } from 'seyfert/lib/types';
import { dbopen,dbread } from '../../components/sqllite';
import { EmbedColors } from 'seyfert/lib/common';
@Declare({
  name: 'manualverify',
  description: 'Manually verify a user'
})
@Options({
    user: createUserOption({
      description: 'User to manually verify.',
      required: true
    })
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
    // @ts-expect-error
    let roleId = JSON.parse(atob(dbread(db,"config",(ctx.guildId || "-1")).value)).verifyrole
    await ctx.options.user.roles.add(roleId)
    let em = new Embed({title:"Success",color:EmbedColors.Green,description:`Gave user <@${ctx.options.user.id}> (\`${ctx.options.user.username}\`) role <@&${roleId}>`})
    ctx.editOrReply({ embeds:[em] })
  }
}