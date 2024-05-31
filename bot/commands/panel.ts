import { Declare, Command, type CommandContext,Embed,Button,ActionRow} from "seyfert";
import { EmbedColors } from "seyfert/lib/common";
import { MessageFlags,ButtonStyle } from "seyfert/lib/types";
import VerifyCommand from "./verify";
import { ButtonInteraction } from "seyfert";
@Declare({
  name: "panel",
  description: "Show the verification panel",
})
export default class PanelCommand extends Command {
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
    let em = new Embed({
      title: "",
      color: EmbedColors.Blurple,
      description:
        "Click the blue button below to verify",
    });
    // buttons
    const v = new Button()
      .setCustomId("verify")
      .setStyle(ButtonStyle.Primary)
      .setLabel("Verify");
    const row = new ActionRow<Button>().setComponents([v]);
    
    
    let m = await ctx.client.messages.write(ctx.channelId,{ embeds: [em], components: [row] });

    await ctx.editOrReply({
      content: "Sent",
      flags: MessageFlags.Ephemeral,
    });
  }
}
