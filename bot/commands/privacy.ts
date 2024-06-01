import { Declare, Command, type CommandContext, Embed } from "seyfert";
import { EmbedColors } from "seyfert/lib/common";
import { dbopen, dbread } from "../../components/sqllite";
import { MessageFlags } from "seyfert/lib/types";
@Declare({
  name: "privacy",
  description: "Show your data and our practices.",
})
export default class PrivacyCommand extends Command {
  async run(ctx: CommandContext) {
    let db = dbopen("db.sql")
    // @ts-ignore
    let iph = dbread(db,"users",ctx.author.id) ? dbread(db,"users",ctx.author.id).value : "We don't have it."
    // @ts-ignore
    let config = JSON.parse(atob(dbread(db,"config",ctx.guildId)))
    await ctx.editOrReply({
     embeds:[new Embed({
        title:"Your data, and how we handle it.",
        description: `
**Your data that we have collected**:
* Your IP address *hash* (note: we cant reverse this hash): \`${iph}\`
* Your User ID: \`${ctx.author.id}\`
${(ctx.guild()?.ownerId == ctx.author.id) ? `* Your server's configuration: \`\`\`json\n${config}\`\`\`` : ""}
`,
        color: EmbedColors.Aqua,
        
     })],
     flags: MessageFlags.Ephemeral
    });
  }
}
