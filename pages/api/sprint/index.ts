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
      const {
        baseURL,
        token,
        defaultValues: { boardId: defaultBoardId } = {},
      } = decryptData<{
        baseURL: string;
        token: string;
        defaultValues?: { boardId?: number };
      }>(authToken);
      const boardId = req.query.boardId || defaultBoardId;
      if (!boardId) {
        return res.status(400).json({ message: "Please provide your boardId" });
      }
      const jiraSprints = await $http.get(
        JIRA_API.sprint.ALL(Number(boardId)),
        {
          headers: { Authorization: token },
          baseURL,
        }
      );
      return res.status(200).json(jiraSprints.data);
    } catch (err: any) {
      return res.status(400).json({ message: "Failed " });
    }
  }
}
