import * as cookie from "cookie";
import { decryptData } from "@/utils/security";
import { NextApiRequest, NextApiResponse } from "next";
import $http from "@/utils/request";
import { JIRA_API } from "@/helper/jira.request";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("origin", req.headers.host);
  if (req.method === "GET") {
    const authToken = cookie.parse(req.headers.cookie || "")._thinkWith;
    if (!authToken) {
      return res.status(200).json({
        ok: true,
      });
    }
    try {
      const { baseURL, token, defaultBoardId } = decryptData<{
        baseURL: string;
        token: string;
        defaultBoardId?: number;
      }>(authToken);
      const jiraData = await $http.get(JIRA_API.user.ME, {
        headers: {
          Authorization: token,
        },
        baseURL,
      });
      const issueTypeData = await $http.get(JIRA_API.issue.ALL_ISSUE_TYPE(), {
        headers: {
          Authorization: token,
        },
        baseURL,
      });

      const boardData = defaultBoardId
        ? await $http.get(JIRA_API.board.ONE(defaultBoardId), {
            headers: {
              Authorization: token,
            },
            baseURL,
          })
        : null;
      const sprintsData = boardData
        ? await $http.get(JIRA_API.sprint.ALL(Number(defaultBoardId)), {
            headers: { Authorization: token },
            baseURL,
          })
        : null;

      res.status(200).json({
        user: jiraData.data,
        board: boardData ? boardData.data : undefined,
        sprints: sprintsData ? sprintsData.data : undefined,
        issuetype: issueTypeData.data,
      });
    } catch (err: any) {
      console.error(err);
      return res.status(400).json({
        message:
          err.message || "Unknown error happen when handle your request!",
      });
    }
  }
}
