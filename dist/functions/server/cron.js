import { AppData } from "../../data/app-data";
import trimAllCache from "../cache/trim-all-cache";
export default async function cron() {
    while (true) {
        await trimAllCache();
        await Bun.sleep(AppData["DefaultCronInterval"]);
    }
}
