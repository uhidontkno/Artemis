import { Client } from 'seyfert';
import { LogLevels } from 'seyfert/lib/common';

const client = new Client();
client.logger.level = LogLevels.Error;


client.start().then(() => client.uploadCommands());