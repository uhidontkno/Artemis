import {
  Declare,
  Command,
  type CommandContext,
  Embed,
  Button,
  ActionRow,
} from "seyfert";
import { EmbedColors } from "seyfert/lib/common";
import { dbopen, dbread } from "../../components/sqllite";
import { MessageFlags, ButtonStyle } from "seyfert/lib/types";
import { decryptData } from "../../components/helper";
@Declare({
  name: "privacy",
  description: "Show your data and our practices.",
})
export default class PrivacyCommand extends Command {
  async run(ctx: CommandContext) {
    let db = dbopen("db.sql");

    let iph = dbread(db, "users", ctx.author.id)
      ? // @ts-ignore
        dbread(db, "users", ctx.author.id).value
      : "We don't have it.";
    let config = '{"error":"You never setup your server with us!"}';
    //try {

    // @ts-ignore
    config = decryptData(dbread(db, "config", ctx.guildId).value, ctx.guildId);
    //} catch {}
    const del = new Button()
      .setCustomId("delete")
      .setStyle(ButtonStyle.Danger)
      .setLabel("Delete my data!");
    const row = new ActionRow<Button>().setComponents([del]);
    await ctx.editOrReply({
      embeds: [
        new Embed({
          title: "Your data, and how we handle it.",
          description: `
**Your data that we have collected**:
* Your IP address *hash* (note: we cant reverse this hash): \n\`${iph}\`
* Your User ID: \`${ctx.author.id}\`
${ctx.guild()?.ownerId == ctx.author.id || ctx.author.id == process.env.BOT_OWNER ? `* Your server's configuration: \n\`\`\`json\n${config}\`\`\`` : ""}

**What data is collected**:
Our verification bot is privacy respecting, so there is zero tracking, zero ads, and zero fingerprinting. [We are even open source under GPL-3.0](https://github.com/uhidontkno/Artemis). We only collect and store data that is absolutely necessary for the functioning of our verification bot. Here is the breakdown:
* **Your IP address** is hashed using 2 numerical, non-cryptographical *(that means we do math)* hashes merged together. Therefore, we cannot reverse it. Additionally, we do not have your IP address stored if you have never successfully verified.
* **Your Discord User ID** is a unique number (called a snowflake) generated by Discord to uniquely identify you without using a username. We currently store this in plain text.
* **Your server configuration** (if you have set up your server with us) is a simple JSON containing all of the paramaters that you or a server admin entered when running the \`/setup\`. This is encrypted using AES-128 with a key based on the guild ID and the bot owner.
* **Verification tokens** are generated based on randomness, time, and your Discord User ID converted to an alphanumerical string. These are temporarily stored in our database and are removed when you finish verifying (5 seconds after you visit our website). These are attached to your Discord User ID and determine if you are detected as an alt account or not.
`,
          color: EmbedColors.Aqua,
        }),
      ],
      flags: MessageFlags.Ephemeral,
      components: [row],
    });
  }
}
