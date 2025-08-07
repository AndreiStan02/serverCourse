import type { Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "./errors.js";
import { createUser, getUser, updateUser, upgradeUserRed } from "../db/queries/users.js";
import { checkPasswordHash, getAPIKey, getBearerToken, hashPassword, makeJWT, makeRefreshToken, validateJWT } from "./auth.js";
import { config } from "../config.js";
import { revokeRefreshToken, saveRefreshToken, userForRefreshToken } from "../db/queries/refreshTokens.js";

export async function handlerCreateUser(req: Request, res: Response) {
  type parameters = {
    password: string;
    email: string;
  };

  const user: parameters = req.body;
  const hashedPassword = await hashPassword(user.password);
  const newUser = await createUser({email: user.email, hashedPassword: hashedPassword});
  respondWithJSON(res, 201, newUser);
}

export async function handlerEditUser(req: Request, res: Response) {
    type parameters = {
        password: string;
        email: string;
    };
    const params: parameters = req.body;

    const accessToken = getBearerToken(req);
    const userID = validateJWT(accessToken, config.secret);
    if(!userID){
        throw new UnauthorizedError("Token malformed or missing.");
    }

    const hashedPassword = await hashPassword(params.password);

    const updatedUser = await updateUser(userID, params.email, hashedPassword);
    respondWithJSON(res, 200, {
        id: updatedUser.id,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        email: updatedUser.email,
        isChirpyRed: updatedUser.isChirpyRed,
    });
}

export async function handlerUserLogin(req: Request, res: Response) {
    type parameters = {
    password: string;
    email: string;
  };

  const params: parameters = req.body;

  const user = await getUser(params.email);
  if (!user) {
    throw new UnauthorizedError("invalid username or password");
  }

  const matching = await checkPasswordHash(
    params.password,
    user.hashedPassword,
  );
  if (!matching) {
    throw new UnauthorizedError("invalid username or password");
  }

  const accessToken = makeJWT(
    user.id,
    60 * 60,
    config.secret,
  );
  const refreshToken = makeRefreshToken();

  const saved = await saveRefreshToken(user.id, refreshToken);
  if (!saved) {
    throw new UnauthorizedError("could not save refresh token");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isChirpyRed: user.isChirpyRed,
    token: accessToken,
    refreshToken: refreshToken,
  });
}

export async function handlerRefresh(req: Request, res: Response) {
  let refreshToken = getBearerToken(req);

  const result = await userForRefreshToken(refreshToken);
  if (!result) {
    throw new UnauthorizedError("invalid refresh token");
  }

  const user = result.user;
  const accessToken = makeJWT(
    user.id,
    60 * 60,
    config.secret,
  );

  type response = {
    token: string;
  };

  respondWithJSON(res, 200, {
    token: accessToken,
  } satisfies response);
}

export async function handlerRevoke(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  await revokeRefreshToken(refreshToken);
  res.status(204).send();
}

export async function handlerUpgradeUser(req: Request, res: Response) {
  type parameters = {
    event: string;
    data: {
      userId: string;
    };
  };

  const apiKey = getAPIKey(req);
  if (apiKey !== config.polkaKey){
    throw new UnauthorizedError("Wrong API key.");
  }

  const params: parameters = req.body;

  if (params.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  await upgradeUserRed(params.data.userId);

  res.status(204).send();
    
}