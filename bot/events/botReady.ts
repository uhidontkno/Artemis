import { createEvent } from "seyfert";
import logger from "../../components/logger.ts"
export default createEvent({
  data: { once: true, name: "botReady" },
  run(user, client) {
    logger.info(`${user.username} is ready`);
  }
})