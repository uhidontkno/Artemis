import { Client } from "seyfert";
import { LogLevels } from "seyfert/lib/common";
import logger from "../components/logger";
const client = new Client();
client.logger.level = LogLevels.Error;

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection:');
    logger.error('Promise: '+ promise)
    logger.error('Reason: '+ reason)
    logger.warn('Error caught, attempting to continue with execution.')
    
});

process.on('warning', (warning) => {
    logger.warn(warning.name + " " + warning.message);
    logger.warn("Stack Trace:" + warning.stack)
  });


client.start().then(() => client.uploadCommands());

