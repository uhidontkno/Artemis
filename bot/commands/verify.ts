import { Declare, Command, type CommandContext } from "seyfert";

@Declare({
  name: "verify",
  description: "Verify yourself",
})
export default class VerifyCommand extends Command {
  async run(ctx: CommandContext) {
    // @ts-ignore average latency between shards
    const ping = ctx.client.gateway.latency;

    await ctx.write({
      content: `The ping is \`${ping}\``,
    });
  }
}
