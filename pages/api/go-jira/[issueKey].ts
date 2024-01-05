import { JIRA_API } from "@/helper/jira.request";
import $http from "@/utils/request";
import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import { decryptData } from "@/utils/security";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authToken = cookie.parse(req.headers.cookie || "")._thinkWith;
  if (!authToken) {
    return res.status(403).json({
      message: "Permission denied :)",
    });
  }
  if (req.method === "GET") {
    try {
      const { issueKey } = req.query;
      if (!issueKey)
        return res.status(400).json({ message: "Unknown issue key" });
      const { baseURL } = decryptData<{
        baseURL: string;
      }>(authToken);
      return res
        .redirect(baseURL + `/browse/${issueKey}`)
        .json({ message: `Go to ticket#${issueKey} on Jira` });
    } catch (err: any) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Unknown error happen when handle your request!" });
    }
  }
  res.status(404).json({ message: "API not found!" });
}
