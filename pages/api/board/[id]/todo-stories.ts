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
      const { baseURL, token, defaultBoardId } = decryptData<{
        baseURL: string;
        token: string;
        defaultBoardId?: number;
      }>(authToken);
      const boardId = req.query.id || defaultBoardId;
      if (!boardId) {
        return res.status(400).json({ message: "Please provide your boardId" });
      }
      const storyIssueType = req.query.storyIssueType as string;
      const statuses = (req.query.statuses as string)?.split(",");
      const jiraSprints = await $http.get(
        JIRA_API.issue.ALL_STORIES(
          Number(boardId),
          storyIssueType || "Story",
          statuses
        ),
        {
          headers: { Authorization: token },
          baseURL,
        }
      );
      return res.status(200).json(jiraSprints.data);
    } catch (err: any) {
      return res.status(400).json({
        message: "Failed",
        details: err.response?.data?.errorMessages || [],
      });
    }
  }
}
