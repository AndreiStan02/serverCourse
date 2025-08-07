import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './errors.js';
import { randomBytes } from 'crypto';
export async function hashPassword(password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}
export async function checkPasswordHash(password, hash) {
    return await bcrypt.compare(password, hash);
}
export function makeJWT(userID, expiresIn, secret) {
    const load = { iss: "chirpy", sub: userID, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expiresIn };
    return jwt.sign(load, secret);
}
export function validateJWT(tokenString, secret) {
    try {
        let res = jwt.verify(tokenString, secret);
        if (!res.sub) {
            throw new Error("");
        }
        return res.sub.toString();
    }
    catch (err) {
        throw new UnauthorizedError("Couldnt validate JWT");
    }
}
export function getBearerToken(req) {
    const token = req.get('Authorization');
    if (!token) {
        throw new UnauthorizedError("Authorization header not found");
    }
    return token.replace("Bearer ", "");
}
export function getAPIKey(req) {
    const key = req.get('Authorization');
    if (!key) {
        throw new UnauthorizedError("Authorization header not found");
    }
    return key.replace("ApiKey ", "");
}
export function makeRefreshToken() {
    const bytes = randomBytes(32);
    return bytes.toString("hex");
}
