import { NextApiRequest, NextApiResponse } from "next";
import * as crypto from "node:crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const iv = crypto.randomBytes(16).toString("hex");
  const sr = crypto.randomBytes(32).toString("hex");

  res.json({ iv, sr });
}
