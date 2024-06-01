import { ComponentCommand, Embed, type ComponentContext,Button,ActionRow,ButtonInteraction } from "seyfert";
import { MessageFlags } from "seyfert/lib/types";
import { EmbedColors } from "seyfert/lib/common";
import { ButtonStyle } from "seyfert/lib/types";
import { dbread,dbdelete,dbopen } from "../../components/sqllite";

export default class DeleteDataButton extends ComponentCommand {
  componentType = "Button" as const;

  filter(ctx: ComponentContext<typeof this.componentType>) {
    return ctx.customId === "delete";
  }

  async run(ctx: ComponentContext<typeof this.componentType>) {
    await ctx.deferReply(true);
    if (!ctx.member?.permissions.has(ctx.member.permissions.Flags.Administrator)) {
        let e = new Embed({title:"Insufficient Permissions",color:EmbedColors.Red,description:"You need the `Administrator` permission to delete your server's data off of Artemis. Keep in mind that this button **does not** delete your user data off of Artemis. "})
        await ctx.editOrReply({ embeds: [e]});return 
    }
    let e = new Embed({title:"Are you 100% SURE you want to delete your server data?",color:EmbedColors.Red,description:"This is your **one and final** confirmation. Keep in mind that this button **DOES NOT** delete your user data (like your IP address) off of Artemis. All of your server data will be permamently lost with no recovery, and you will have to run `/setup` and re-invite me again. I will leave your server if you press Yes. Now, for the once and final time... Are you sure you want to delete your server data?"})
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
  
  let m = await ctx.editOrReply({ embeds: [e], components: [row] });
  // @ts-expect-error
  const collector = m.createComponentCollector();
  collector.run("cancel", async (i: ButtonInteraction) => {
    i.editOrReply({content:"Operation cancelled. Thank you for keeping me around."})
  });
  collector.run("confirm", async (i: ButtonInteraction) => {
    if (!i.isButton()) {
      return;
    }
    if (i.user.id != ctx.author.id) {
      return i.editOrReply({
        content: "This is **not** your button.",
        flags: MessageFlags.Ephemeral,
      });
    }
    await i.deferReply(64);
    i.editOrReply({content:"Deleting your data...",flags: MessageFlags.Ephemeral});
    if (!ctx.me()?.kickable()) {
        i.editOrReply({content:"What a miracle! You never gave me permission to kick myself.",flags: MessageFlags.Ephemeral,});return
    }
    let db = dbopen("db.sql")
    // @ts-expect-error
    if (dbread(db,"config",ctx.guildId)) {
        // @ts-expect-error
        await ctx.client.messages.write(JSON.parse(atob(dbread(db,"config",ctx.guildId).value)).loggingchannel, {
            content: `## <@${ctx.author.id}> HAS DELETED THIS SERVER'S DATA!\nSorry to see you all go @everyone... :sob:`,
          });
          await ctx.client.messages.write(ctx.channelId, {
            content: `Sorry to see you all go... :sob:`,
          });
        // @ts-expect-error
        dbdelete(db,"config",ctx.guildId)
        i.editOrReply({content:"Data deleted. Bye!",flags: MessageFlags.Ephemeral,});
        await ctx.me()?.kick();
    } else {
        i.editOrReply({content:"What a miracle! There was no data to exist.",flags: MessageFlags.Ephemeral,});
    }
});
  }
}
