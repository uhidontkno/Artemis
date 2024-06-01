let ipr = require("ip-range-check");
import logger from "../components/logger";
import * as cgraphy from "node:crypto";
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

export async function startVerification(id: string) {
  let token = (
    (BigInt(id) + BigInt(Date.now())) *
    BigInt(Math.floor(12 * (Math.random() + 1)))
  )
    .toString(36)
    .replaceAll(".", "");
  let db = dbopen("db.sql", true);
  dbwrite(db, "verification_tokens", token, id.toString());
  let signals = await Bun.file("signals.db.json").json();
  signals["signals"][String(token)] = "started";
  await Bun.write("signals.db.json", JSON.stringify(signals));

  return token;
}
export async function endVerification(token: string) {
  let db = dbopen("db.sql", true);
  dbdelete(db, "verification_tokens", token);
  let signals = await Bun.file("signals.db.json").json();
  signals["signals"][String(token)] = undefined;
  await Bun.write("signals.db.json", JSON.stringify(signals));
}

export function secureIPHash(ip: string, seed: bigint): string {
  return `${Bun.hash.cityHash64(ip, seed)}${Bun.hash.crc32(ip)}`;
}

// AES operations

export function aesEncrypt(
  mode: string,
  text: string,
  key: string,
  iv: string = "12345DefaultIVzz",
): string {
  let keySize: number;
  let ivSize: number;

  switch (mode) {
    case "aes-128-cbc":
      keySize = 16;
      ivSize = 16;
      break;
    case "aes-192-cbc":
      keySize = 24;
      ivSize = 16;
      break;
    case "aes-256-cbc":
      keySize = 32;
      ivSize = 16;
      break;
    default:
      throw new Error("Unsupported AES mode");
  }
  const cipher = cgraphy.createCipheriv(
    mode,
    key.slice(0, keySize),
    iv.slice(0, ivSize ),
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function encryptData(serverdata: string, guildid: string) {
  serverdata = btoa(serverdata);
  // @ts-expect-error
  let key = (BigInt(process.env.BOT_OWNER) + BigInt(guildid))
    .toString(36)
    .padEnd(16, "%");
  return aesEncrypt("aes-128-cbc", serverdata, key);
}

export function aesDecrypt(
  mode: string,
  text: string,
  key: string,
  iv: string = "12345DefaultIVzz",
): string {
  let keySize: number;
  let ivSize: number;

  switch (mode) {
    case "aes-128":
      keySize = 16;
      ivSize = 16;
      break;
    case "aes-192":
      keySize = 24;
      ivSize = 16;
      break;
    case "aes-256":
      keySize = 32;
      ivSize = 16;
      break;
    default:
      throw new Error("Unsupported AES mode");
  }
  mode = mode + "-cbc";
  const decipher = cgraphy.createDecipheriv(
    mode,
    key.slice(0, keySize),
    iv.slice(0, ivSize),
  );
  let decrypted = decipher.update(text, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function decryptData(serverdata: string, guildid: string) {
  // @ts-expect-error
  let key = (BigInt(process.env.BOT_OWNER) + BigInt(guildid))
    .toString(36)
    .padEnd(16, "%");
  return atob(aesDecrypt("aes-128", serverdata, key));
}
