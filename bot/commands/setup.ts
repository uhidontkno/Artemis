import { Declare, Command, type CommandContext, Options, createRoleOption, Embed, ActionRow,Button } from 'seyfert';
import { dbopen,dbwrite,dbread } from "../../components/sqllite"
import { EmbedColors } from 'seyfert/lib/common';
import { ButtonStyle } from 'seyfert/lib/types';
@Declare({
  name: 'setup',
  description: 'Setup this server with Atermis.'
})
@Options({
    verifyRole: createRoleOption({
      description: 'Role to give users when they verify.',
      required: true
    })
})
export default class SetupCommand extends Command {

  async run(ctx: CommandContext) {
    await ctx.deferReply();
    let db = dbopen("db.sql")
    if (dbread(db,"config",(ctx.guildId || "-1"))) {
        let em = new Embed({title:"Question",color:EmbedColors.Blurple,description:"A configuration for this server has been detected. Do you want to overwrite it?"})
        // buttons
        const confirm = new Button().setCustomId('confirm').setStyle(ButtonStyle.Danger).setLabel('Yes');
        const cancel = new Button().setCustomId('cancel').setStyle(ButtonStyle.Secondary).setLabel('No');
        const row = new ActionRow<Button>().setComponents([cancel,confirm]);
        
        await ctx.editOrReply({embeds:[em],components:[row]})
    }
  }
}