let ipr = require("ip-range-check")

export async function isVPN(ip:string): Promise<boolean> {
    let ranges = Bun.file("components/vpn_ips.txt")
    return ipr(ip,await ranges.text())
}