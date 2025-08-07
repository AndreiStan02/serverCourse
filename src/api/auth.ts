import bcrypt from 'bcrypt';
import  jwt  from 'jsonwebtoken';
import {JwtPayload} from 'jsonwebtoken'
import { NotFoundError, UnauthorizedError } from './errors.js';
import type { Request, Response } from "express";
import { randomBytes } from 'crypto';
import { isNull } from 'drizzle-orm';
import { respondWithJSON } from './json.js';

export async function hashPassword(password: string){
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
}

export async function checkPasswordHash(password: string, hash: string){
    return await bcrypt.compare(password, hash);
}

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;
    const load: payload = {iss: "chirpy", sub: userID, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expiresIn};

    return jwt.sign(load, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
    try {
        let res = jwt.verify(tokenString, secret);
        if(!res.sub){
            throw new Error("");
        }
        return res.sub.toString();
    } catch (err) {
        throw new UnauthorizedError("Couldnt validate JWT");
    }
}

export function getBearerToken(req: Request): string {
    const token = req.get('Authorization');
    if(!token){
        throw new UnauthorizedError("Authorization header not found");
    }
    return token.replace("Bearer ", "");
}

export function getAPIKey(req: Request): string {
    const key = req.get('Authorization');
    if(!key){
        throw new UnauthorizedError("Authorization header not found");
    }
    return key.replace("ApiKey ", "");
}

export function makeRefreshToken(){
    const bytes = randomBytes(32);
    return bytes.toString("hex");
}