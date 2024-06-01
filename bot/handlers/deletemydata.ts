import { ComponentCommand, Embed, type ComponentContext,Button,ActionRow,ButtonInteraction } from "seyfert";
import { MessageFlags } from "seyfert/lib/types";
import { EmbedColors } from "seyfert/lib/common";
import { ButtonStyle } from "seyfert/lib/types";

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
});
  }
}
