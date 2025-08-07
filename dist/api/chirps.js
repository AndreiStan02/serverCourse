import { respondWithJSON } from "./json.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";
import { createChirp, deleteChirpById, getAllChirps, getAllChirpsForUser, getOneChirp } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "./auth.js";
import { config } from "../config.js";
export async function handlerChirpsCreate(req, res) {
    const params = req.body;
    const token = getBearerToken(req);
    const id = validateJWT(token, config.secret);
    if (!id) {
        throw new UnauthorizedError("JWT token unauthorized");
    }
    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }
    const words = params.body.split(" ");
    const badWords = ["kerfuffle", "sharbert", "fornax"];
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const loweredWord = word.toLowerCase();
        if (badWords.includes(loweredWord)) {
            throw new BadRequestError("Chirp cant contain bad words.");
        }
    }
    const chirp = await createChirp({ body: params.body, userId: id });
    respondWithJSON(res, 201, chirp);
}
export async function handlerChirpsGetAll(req, res) {
    let authorId = "";
    let authorIdQuery = req.query.authorId;
    if (typeof authorIdQuery === "string") {
        authorId = authorIdQuery;
    }
    let sort = "";
    let sortQuery = req.query.sort;
    if (typeof sortQuery === "string") {
        sort = sortQuery;
    }
    if (authorId !== "") {
        const chirps = await getAllChirpsForUser(authorId, sort);
        respondWithJSON(res, 200, chirps);
    }
    else {
        const chirps = await getAllChirps(sort);
        respondWithJSON(res, 200, chirps);
    }
}
export async function handlerChirpsGetById(req, res) {
    const params = req.params;
    const chirp = await getOneChirp(params.chirpID);
    if (!chirp) {
        throw new NotFoundError("Chirp with that id not found");
    }
    respondWithJSON(res, 200, chirp);
}
export async function handlerDeleteChirp(req, res) {
    const params = req.params;
    const chirp = await getOneChirp(params.chirpID);
    if (!chirp) {
        throw new NotFoundError("Chirp with that id not found");
    }
    const accessToken = getBearerToken(req);
    const userID = validateJWT(accessToken, config.secret);
    if (!userID) {
        throw new UnauthorizedError("Token malformed or missing.");
    }
    if (chirp.userId !== userID) {
        throw new ForbiddenError("Not the owner of the chirp.");
    }
    await deleteChirpById(chirp.id);
    respondWithJSON(res, 204, {});
}
