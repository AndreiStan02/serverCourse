import { config } from "../config.js";
import { respondWithError } from "./json.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";
export function middlewareLogResponse(req, res, next) {
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${statusCode}`);
        }
    });
    next();
}
export function middlewareMetricsInc(_, __, next) {
    config.fileserverHits++;
    next();
}
export function errorMiddleWare(err, _, res, __) {
    let statusCode = 500;
    let message = "Something went wrong on our end";
    if (err instanceof BadRequestError) {
        statusCode = 400;
        message = err.message;
    }
    else if (err instanceof UnauthorizedError) {
        statusCode = 401;
        message = err.message;
    }
    else if (err instanceof ForbiddenError) {
        statusCode = 403;
        message = err.message;
    }
    else if (err instanceof NotFoundError) {
        statusCode = 404;
        message = err.message;
    }
    console.log(err.message);
    respondWithError(res, statusCode, message);
}
