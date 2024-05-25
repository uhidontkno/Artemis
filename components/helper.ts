let ipr = require("ip-range-check")
import logger from "../components/logger"
import sqllite, { dbopen } from "../components/sqllite"

export async function isVPN(ip:string): Promise<boolean> {
    let ranges = Bun.file("components/vpn_ips.txt")
    if (!ranges.exists()) {
        logger.error("vps_ips.txt does not exist! isVPN() will always return false.")
        return false;
    }
    return ipr(ip,(await ranges.text()).split("\n"))
}

export async function startVerification(id:number) {
 let token = ((id+Date.now())*(8.44*Math.random())).toString(36).replaceAll(".","");
 let db = dbopen("db.sql",true)
 
}
