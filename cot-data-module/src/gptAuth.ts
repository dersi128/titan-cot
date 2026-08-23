import type { NextFunction, Request, Response } from "express";

/**
 * Optional gate for ChatGPT Actions (`/api/gpt/*`).
 * Set `CHATGPT_API_KEY` on Render. If unset, GPT routes stay open (dev only).
 *
 * ChatGPT Custom GPT → Authentication → API Key → Header `X-Titan-Key`
 */
export function requireChatGptApiKey(request: Request, response: Response, next: NextFunction): void {
  const expected = process.env.CHATGPT_API_KEY?.trim();
  if (!expected) {
    next();
    return;
  }

  const fromHeader =
    request.header("x-titan-key")?.trim() ||
    request.header("x-api-key")?.trim() ||
    bearerToken(request.header("authorization"));

  if (!fromHeader || fromHeader !== expected) {
    response.status(401).json({
      error: "Unauthorized",
      hint: "Send header X-Titan-Key with your CHATGPT_API_KEY value.",
    });
    return;
  }

  next();
}

function bearerToken(authorization: string | undefined): string | undefined {
  if (!authorization) return undefined;
  const m = /^Bearer\s+(.+)$/i.exec(authorization.trim());
  return m?.[1]?.trim();
}
