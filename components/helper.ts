let ipr = require("ip-range-check")
import logger from "../components/logger"

export async function isVPN(ip:string): Promise<boolean> {
    let ranges = Bun.file("components/vpn_ips.txt")
    if (!ranges.exists()) {
        logger.error("vps_ips.txt does not exist! isVPN() will always return false.")
        return false;
    }
    return ipr(ip,(await ranges.text()).split("\n"))
}