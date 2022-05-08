import log from "./logger";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });


export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === "production";

export const SESSION_SECRET: string = process.env["SESSION_SECRET"]!;
export const MONGODB_URI = prod ? process.env["MONGODB_URI"] : process.env["MONGODB_URI_LOCAL"];

log.info(MONGODB_URI)

if (!SESSION_SECRET) {
    log.error("No client secret. Set SESSION_SECRET environment variable.");
    process.exit(1);
}

if (!MONGODB_URI) {
    if (prod) {
        log.error("No mongo connection string. Set MONGODB_URI environment variable.");
    } else {
        log.error("No mongo connection string. Set MONGODB_URI_LOCAL environment variable.");
    }
    process.exit(1);
}
