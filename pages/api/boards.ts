import { JIRA_API } from "@/helper/jira.request";
import $http from "@/utils/request";
import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import { decryptData, encryptData } from "@/utils/security";

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
      const { baseURL, token } = decryptData<{
        baseURL: string;
        token: string;
      }>(authToken);
      const jiraData = await $http.get(JIRA_API.board.ALL, {
        headers: {
          Authorization: token,
        },
        baseURL,
      });
      return res.status(200).json(jiraData.data);
    } catch (err: any) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Unknown error happen when handle your request!" });
    }
  }
  if (req.method === "PATCH") {
    try {
      const { boardId } = req.body;
      const { baseURL, token } = decryptData<{
        baseURL: string;
        token: string;
      }>(authToken);
      const newPayload = boardId
        ? { token, baseURL, defaultBoardId: boardId }
        : { token, baseURL };
      const newToken = encryptData(JSON.stringify(newPayload));

      res.setHeader(
        "Set-Cookie",
        `_thinkWith=${newToken}; secure; maxAge=1296000`
      );
      return res.status(200).json({
        defaultBoardId: boardId,
      });
    } catch (err: any) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Unknown error happen when handle your request!" });
    }
  }
  res.status(404).json({ message: "API not found!" });
}
