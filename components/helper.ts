let ipr = require("ip-range-check");
import logger from "../components/logger";
import sqllite, {
  dbdelete,
  dbopen,
  dbwrite,
  dbread,
} from "../components/sqllite";

export async function isVPN(ip: string): Promise<boolean> {
  let ranges = Bun.file("components/vpn_ips.txt");
  if (!ranges.exists()) {
    logger.error(
      "vps_ips.txt does not exist! isVPN() will always return false.",
    );
    return false;
  }
  return ipr(ip, (await ranges.text()).split("\n"));
}

export async function startVerification(id: number) {
  let token = ((id + Date.now()) * (8.44 * Math.random()))
    .toString(36)
    .replaceAll(".", "");
  let db = dbopen("db.sql", true);
  dbwrite(db, "verification_tokens", token, id.toString());
  let signals = await Bun.file("signals.db.json").json();
  signals["signals"][id] = "started";
  
  return token;
}
export function endVerification(token: string) {
  let db = dbopen("db.sql", true);
  dbdelete(db, "verification_tokens", token);
}

export function secureIPHash(ip: string, seed: bigint): string {
  return `${Bun.hash.cityHash64(ip, seed)}${Bun.hash.crc32(ip)}`;
}
