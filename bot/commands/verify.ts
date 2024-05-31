import {
  Declare,
  Command,
  type CommandContext,
  Embed,
  User,
  GuildMember,
} from "seyfert";
import { EmbedColors } from "seyfert/lib/common";
import { dbopen, dbread } from "../../components/sqllite";
import { endVerification, startVerification } from "../../components/helper";
var c: string = "";
var signal: string;
function waitSignal(
  interval: number,
  fn: () => Promise<string>,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const id = setInterval(async () => {
      try {
        let _ = await fn();

        if (_ != "started") {
          clearInterval(id);
          resolve(_);
        }
      } catch (error) {
        clearInterval(id);
        reject(error);
      }
    }, interval);
  });
}

@Declare({
  name: "verify",
  description: "Verify yourself",
})
export default class VerifyCommand extends Command {
  async run(ctx: CommandContext) {
    if (ctx.author.bot || ctx.author.id == ctx.guild()?.ownerId) {
      let em = new Embed({
        title: "Error",
        color: EmbedColors.Red,
        description:
          "Server owners and bots cannot use this command.",
      });
      await ctx.editOrReply({ embeds: [em] });
      return;
    }
    await ctx.deferReply(true);
    let db = dbopen("db.sql");
    if (!dbread(db, "config", ctx.guildId || "-1")) {
      let em = new Embed({
        title: "Error",
        color: EmbedColors.Red,
        description:
          "This server has not been setup yet. Please run the `/setup` command.",
      });
      await ctx.editOrReply({ embeds: [em] });
      return;
    }

    let roleId = JSON.parse(
      // @ts-expect-error
      atob(dbread(db, "config", ctx.guildId || "-1").value),
    ).verifyrole;
    let user = ctx.member;
    if (user.roles.keys.includes(roleId)) {
      let em = new Embed({
        title: "Error",
        color: EmbedColors.Red,
        description: "You already have the verified role.",
      });
      await ctx.editOrReply({ embeds: [em] });
      return;
    } else {
      c = await startVerification(ctx.author.id);

      let fn = async () => {
        signal = await Bun.file("signals.db.json").json();
        signal = signal["signals"][c];
        return signal;
      };
      let em = new Embed({
        title: "",
        color: EmbedColors.Blue,
        description: `Please click the below link to start verification. Don't worry, this is 100% automatic.\n${process.env["DEPLOYMENT_URL"]}/verify/${c}/`,
      });
      em.addFields({ name: "Status", value: "Waiting for verification..." });
      em.setFooter({
        text: "Powered by Artemis | A FOSS Double Counter alternative.",
      });
      await ctx.editOrReply({ embeds: [em] });

      await waitSignal(1000, fn);
      signal = await Bun.file("signals.db.json").json();
      signal = signal["signals"][c];
      //let s = await Bun.file("signals.db.json").json();
      //s[c] = undefined;
      //Bun.write("signals.db.json",JSON.stringify(s))
      if (signal.startsWith("failed")) {
        endVerification(c)
        let desc = "";
        switch (signal.split(";")[0]) {
          case "failed alt":
            desc = "we've detected that you're on an alt account";
            break;
          case "failed vpn":
            desc = "we detect that you're on a VPN or a proxy.";
            break;
          case "failed override":
            desc = signal.split(";")[1]
            break;
          default:
            desc = "we don't know";
        }
        let em = new Embed({
          title: "Verification was unsuccessful.",
          color: EmbedColors.Red,
          description: `You have failed verification because ${desc}`,
        });
        em.setFooter({
          text: "Powered by Artemis | A FOSS Double Counter alternative.",
        });
        await ctx.editOrReply({ embeds: [em] });
      } else {
        let em = new Embed({
          title: "Verification was successful!",
          color: EmbedColors.Green,
          description: "",
        });
        em.setFooter({
          text: "Powered by Artemis | A FOSS Double Counter alternative.",
        });
        await ctx.editOrReply({ embeds: [em] });
        await user.roles.add(roleId);
        endVerification(c)
      }
    }
  }
}
