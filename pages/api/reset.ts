import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    res.setHeader("Set-Cookie", `_thinkWith=`);
    return res.status(200).json({
      message: "Just reset! Nothing to see",
    });
  }
  res.status(404).json({ message: "API not found!" });
}
