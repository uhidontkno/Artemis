import { Declare, Command, type CommandContext } from 'seyfert';

@Declare({
  name: 'setup',
  description: 'Setup this server with Atermis.'
})
export default class SetupCommand extends Command {

  async run(ctx: CommandContext) {
    // @ts-ignore average latency between shards
    const ping = ctx.client.gateway.latency;

    await ctx.write({
      content: `The ping is \`${ping}\``
    });
  }
}