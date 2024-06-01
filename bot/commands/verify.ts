import {
  Declare,
  Command,
  type CommandContext,
  Embed,
  User,
  GuildMember,
} from "seyfert";
import { MessageFlags } from "seyfert/lib/types";
import { EmbedColors } from "seyfert/lib/common";
import { dbopen, dbread } from "../../components/sqllite";
import {
  decryptData,
  endVerification,
  startVerification,
} from "../../components/helper";
var c: string = "";
var signal: string;
let counter = 0;
function waitSignal(
  interval: number,
  fn: () => Promise<string>,
): Promise<string> {
  return new Promise((resolve, reject) => {

    const id = setInterval(async () => {
      if (counter > 120) {
        clearInterval(id);
        resolve("failed timeout")
      }
      counter++;
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
        description: "Server owners and bots cannot use this command.",
      });
      await ctx.editOrReply({ embeds: [em], flags: MessageFlags.Ephemeral });
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
      await ctx.editOrReply({ embeds: [em], flags: MessageFlags.Ephemeral });
      return;
    }

    let config = 
      JSON.parse(
        decryptData(
          // @ts-expect-error
          dbread(db, "config", ctx.guildId || "-1").value,
          String(ctx.guildId),
        ),
      );
    let roleId = config.verifyrole;
    let punishment = config.actiononfail;
    let user = ctx.member;
    //@ts-expect-error
    if (user.roles.keys.includes(roleId)) {
      let em = new Embed({
        title: "Error",
        color: EmbedColors.Red,
        description: "You already have the verified role.",
      });
      await ctx.editOrReply({ embeds: [em], flags: MessageFlags.Ephemeral });
      return;
    } else {
      c = await startVerification(ctx.author.id);
      // @ts-expect-error
      let log = `**Verification started** for user \`${ctx.author.username}\` (\`${ctx.author.id}\`)\n* Joined server: <t:${Math.round(ctx.member?.joinedTimestamp / 1000)}:R> (<t:${Math.round(ctx.member?.joinedTimestamp / 1000)}:f>)\n* Joined Discord: <t:${Math.round(ctx.member?.createdTimestamp / 1000)}:R> (<t:${Math.round(ctx.member?.createdTimestamp / 1000)}:f>)\n* Code: \`${c}\``;
      let logMsg = await ctx.client.messages.write(config.loggingchannel, {
        content: log,
      });
      let fn = async () => {
        signal = await Bun.file("signals.db.json").json();
        // @ts-expect-error
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
      // @ts-expect-error
      signal = signal["signals"][c];
      //let s = await Bun.file("signals.db.json").json();
      //s[c] = undefined;
      //Bun.write("signals.db.json",JSON.stringify(s))
      if (signal.startsWith("failed")) {
        endVerification(c);
        // @ts-expect-error
        log = `**Verification ended** for user \`${ctx.author.username}\` (\`${ctx.author.id}\`)\n* Joined server: <t:${Math.round(ctx.member?.joinedTimestamp / 1000)}:R> (<t:${Math.round(ctx.member?.joinedTimestamp / 1000)}:f>)\n* Joined Discord: <t:${Math.round(ctx.member?.createdTimestamp / 1000)}:R> (<t:${Math.round(ctx.member?.createdTimestamp / 1000)}:f>)\n* Code: ~~\`${c}\`~~\n* Verification failed with reason: `;

        let desc = "";
        switch (signal.split(";")[0]) {
          case "failed alt":
            log = log + "This user is an alt account";
            desc = "we've detected that you're on an alt account";
            break;
          case "failed vpn":
            log = log + "A VPN was detected";
            desc = "we detect that you're on a VPN or a proxy.";
            break;
          case "failed timeout":
              log = log + "The user did not verify within 2 minutes.";
              desc = "you never verified within 2 minutes";
            break;
          case "failed override":
            log =
              log +
              signal
                .split(";")[1]
                .replace("because", "")
                .replaceAll("you're", "This user")
                .replaceAll("you are", "This user");
            desc = signal.split(";")[1];
            break;
          default:
            log = log + signal;
            desc = "we don't know";
        }
        await logMsg.edit({ content: log });
        let punishmentString = ". ";
        if (signal != "failed timeout") {
        switch (punishment) {
          case "nothing":
            break;
          case "kick":
            log =
              log +
              `\n* User scheduled to get kicked <t:${Math.floor(Date.now() / 1000) + 15}:R>`;
            punishmentString =
              ". Additionally, you will be kicked from this server in 15 seconds.";
            setTimeout(async () => {
              if (await ctx.member?.kickable()) {
                // do not attempt to kick if cannot
                await ctx.member?.kick(
                  "Kicked by Artemis: User failed to verify. Use /setup to change this behavior.",
                );
              } else {
                log =
                  log +
                  `\n:warning: **CANNOT PUNISH USER**; I do not have permission to punish this user.`;

                punishmentString =
                  punishmentString +
                  ".. If I could, but no, I cannot because whoever invited me never gave me permission to do so.";
              }
            }, 15000);
            break;
          case "mute.15":
            log =
              log + `\n* User got muted <t:${Math.floor(Date.now() / 1000)}:R>`;
            if (await ctx.member?.moderatable()) {
              // do not attempt to mute if cannot
              punishmentString =
                ". Additionally, you will be muted for 15 minutes.";
              setTimeout(async () => {
                await ctx.member?.edit(
                  {
                    communication_disabled_until: new Date(
                      Date.now() + 15 * 60 * 1000,
                    ).toISOString(),
                  },
                  "Muted by Artemis: User failed to verify. Use /setup to change this behavior.",
                );
              }, 1000);
            } else {
              log =
                log +
                `\n:warning: **CANNOT PUNISH USER**; I do not have permission to punish this user.`;
              punishmentString =
                punishmentString +
                ".. If I could, but no, I cannot because whoever invited me never gave me permission to do so.";
            }
            break;
          case "mute.60":
            log =
              log + `\n* User got muted <t:${Math.floor(Date.now() / 1000)}:R>`;
            punishmentString = ". Additionally, you will be muted for 1 hour.";
            if (await ctx.member?.moderatable()) {
              // do not attempt to mute if cannot
              setTimeout(async () => {
                await ctx.member?.edit(
                  {
                    communication_disabled_until: new Date(
                      Date.now() + 60 * 60 * 1000,
                    ).toISOString(),
                  },
                  "Muted by Artemis: User failed to verify. Use /setup to change this behavior.",
                );
              }, 1000);
            } else {
              log =
                log +
                `\n:warning: **CANNOT PUNISH USER**; I do not have permission to punish this user.`;
              punishmentString =
                punishmentString +
                ".. If I could, but no, I cannot because whoever invited me never gave me permission to do so.";
            }
            break;
          case "mute.180":
            log =
              log + `\n* User got muted <t:${Math.floor(Date.now() / 1000)}:R>`;
            punishmentString = ". Additionally, you will be muted for 3 hours.";
            if (await ctx.member?.moderatable()) {
              // do not attempt to mute if cannot
              setTimeout(async () => {
                await ctx.member?.edit(
                  {
                    communication_disabled_until: new Date(
                      Date.now() + 60 * 3 * 60 * 1000,
                    ).toISOString(),
                  },
                  "Muted by Artemis: User failed to verify. Use /setup to change this behavior.",
                );
              }, 1000);
            } else {
              log =
                log +
                `\n:warning: **CANNOT PUNISH USER**; I do not have permission to punish this user.`;
              punishmentString =
                punishmentString +
                ".. If I could, but no, I cannot because whoever invited me never gave me permission to do so.";
            }
            break;
          case "ban":
            log =
              log +
              `\n* User scheduled to get BANNED <t:${Math.floor(Date.now() / 1000) + 15}:R>`;
            punishmentString =
              ". Additionally, you will be banned from this server in 15 seconds.";
            if (await ctx.member?.bannable()) {
              // do not attempt to ban if cannot
              setTimeout(async () => {
                await ctx.member?.ban(
                  undefined,
                  "Banned by Artemis: User failed to verify. Use /setup to change this behavior.",
                );
              }, 15000);
            } else {
              log =
                log +
                `\n:warning: **CANNOT PUNISH USER**; I do not have permission to punish this user.`;
              punishmentString =
                punishmentString +
                ".. If I could, but no, I cannot because whoever invited me never gave me permission to do so.";
            }
            break;
          default:
            break;
        }
        await logMsg.edit({ content: log });
      }
        let em = new Embed({
          title: "Verification was unsuccessful.",
          color: EmbedColors.Red,
          description: `You have failed verification because ${desc}${punishmentString}`,
        });
        em.setFooter({
          text: "Powered by Artemis | A FOSS Double Counter alternative.",
        });
        await ctx.editOrReply({ embeds: [em] });
      } else {
        // @ts-expect-error
        log = `**Verification ended** for user \`${ctx.author.username}\` (\`${ctx.author.id}\`)\n* Joined server: <t:${Math.round(ctx.member?.joinedTimestamp / 1000)}:R> (<t:${Math.round(ctx.member?.joinedTimestamp / 1000)}:f>)\n* Joined Discord: <t:${Math.round(ctx.member?.createdTimestamp / 1000)}:R> (<t:${Math.round(ctx.member?.createdTimestamp / 1000)}:f>)\n* Code: ~~\`${c}\`~~\n* Verification passed!`;
        let em = new Embed({
          title: "Verification was successful!",
          color: EmbedColors.Green,
          description: "",
        });
        em.setFooter({
          text: "Powered by Artemis | A FOSS Double Counter alternative.",
        });
        await ctx.editOrReply({ embeds: [em] });
        await logMsg.edit({ content: log });
        try {
          // @ts-expect-error
          await user.roles.add(roleId);
          log = log + `\n* Role **given** to user!`;
          await logMsg.edit({ content: log });
        } catch {
          // @ts-expect-error
          await user.roles.add(roleId);
          log = log + `\n* Role could **not** be given to user!`;
          await logMsg.edit({ content: log });
        }
        endVerification(c);
      }
    }
  }
}
