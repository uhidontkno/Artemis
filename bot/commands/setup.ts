import { Declare, Command, type CommandContext, Options, createRoleOption, Embed, ActionRow,Button, ButtonInteraction } from 'seyfert';
import { dbopen,dbwrite,dbread } from "../../components/sqllite"
import { EmbedColors } from 'seyfert/lib/common';
import { ButtonStyle, MessageFlags } from 'seyfert/lib/types';



@Options({
    verifyrole: createRoleOption({
      description: 'Role to give users when they verify.',
      required: true
    })
})
@Declare({
    name: 'setup',
    description: 'Setup this server with Atermis.'
})
export default class SetupServerCommand extends Command {

  async run(ctx: CommandContext) {
    await ctx.deferReply();
    let db = dbopen("db.sql")
    if (dbread(db,"config",(ctx.guildId || "-1"))) {
        let em = new Embed({title:"Question",color:EmbedColors.Blurple,description:"A configuration for this server has been detected. Do you want to overwrite it?"})
        // buttons
        const confirm = new Button().setCustomId('confirm').setStyle(ButtonStyle.Danger).setLabel('Yes');
        const cancel = new Button().setCustomId('cancel').setStyle(ButtonStyle.Secondary).setLabel('No');
        const row = new ActionRow<Button>().setComponents([cancel,confirm]);
        
        let m = await ctx.editOrReply({embeds:[em],components:[row]})
        // @ts-expect-error
        const collector = m.createComponentCollector();
        collector.run('confirm', async (i:ButtonInteraction) => {
            if (!i.isButton()) {return}
            if (i.user.id != ctx.author.id) {
                // @ts-expect-error
                return i.write({content:"This is **not** your button.",flags:[MessageFlags.Ephemeral]})
            }
            let em = new Embed({title:"Success",color:EmbedColors.Green,description:"Set configuration for this server."})
            // @ts-ignore
            dbwrite(db,"config",(ctx.guildId || "-1"),btoa(JSON.stringify({"verifyRole":ctx.options.verifyrole})))
            await ctx.editOrReply({embeds: [em]})
        });
        collector.run('cancel', async (i:ButtonInteraction) => {
            if (!i.isButton()) {return}
            if (i.user.id != ctx.author.id) {
                // @ts-expect-error
                return await i.write({content:"This is **not** your button.",flags:[MessageFlags.Ephemeral]})
            }
            // @ts-expect-error
            await ctx.editOrReply({content:"Cancelled.",flags:[MessageFlags.Ephemeral]})
        });
        

    } else {
        let em = new Embed({title:"Success",color:EmbedColors.Green,description:"Set configuration for this server."})
        // @ts-ignore
        dbwrite(db,"config",(ctx.guildId || "-1"),btoa(JSON.stringify({"verifyRole":ctx.options.verifyRole})))
        await ctx.editOrReply({embeds: [em]})
    }
  }
}