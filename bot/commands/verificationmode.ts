import { Declare, Command, type CommandContext,Options,createNumberOption,Embed} from "seyfert";
import { dbopen,dbread,dbwrite } from "../../components/sqllite";
import { encryptData,decryptData } from "../../components/helper";
import { EmbedColors } from "seyfert/lib/common";
import { MessageFlags } from "seyfert/lib/types";
@Declare({
  name: "verificationmode",
  description: "Change this server's verification mode",
})
@Options({
  mode: createNumberOption({
    description: "Change verification mode",
    required: true,
    choices:[
      {"name":"On","value":1},
      {"name":"Off (Auto-verify)","value":0},
      {"name":"Disabled","value":-1}
    ]
  })
})
export default class ToggleVerifCommand extends Command {
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
    try {
    await ctx.deferReply(true);
    let db = dbopen("db.sql");
    if (!dbread(db, "config", ctx.guildId || "-1")) {
      let em = new Embed({
        title: "Error",
        color: EmbedColors.Red,
        description:
          "This server has not been setup yet. Please run the `/setup` command.",
      });
      await ctx.editOrReply({ embeds: [em], flags: MessageFlags.Ephemeral });
      return;
    }

    let config = JSON.parse(
      decryptData(
        // @ts-expect-error
        dbread(db, "config", ctx.guildId || "-1").value,
        String(ctx.guildId),
      ),
    );
    // @ts-expect-error
    config["verification"] = ctx.options.mode
    dbwrite(
      db,
      "config",
      ctx.guildId || "-1",

      encryptData(
        JSON.stringify(config),
        String(ctx.guildId),
      ),
    );
    let em = new Embed({
      title: "Success",
      color: EmbedColors.Green,
      description: "Updated verification mode for this server.",
    });
    await ctx.editOrReply({ embeds: [em], components: [] });
    return;
  } catch (e) {
    let em = new Embed({
      title: "Error",
      color: EmbedColors.Red,
      description: `\`\`\`\n${e}\n\`\`\``,
    });
    await ctx.editOrReply({ embeds: [em], components: [] });
    return;
  }
  }
}
