import { config } from "../config.js";
import { deleteAllUsers } from "../db/queries/users.js";
import { respondWithError } from "./json.js";
export async function handlerReset(_, res) {
    if (config.platform === "dev") {
        config.fileserverHits = 0;
        res.write("Hits reset to 0");
        res.end();
        await deleteAllUsers();
    }
    else {
        respondWithError(res, 403, "Need dev privilages to do that");
    }
}
