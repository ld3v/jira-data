import { JIRA_API } from "@/helper/jira.request";
import $http from "@/utils/request";
import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import { decryptData } from "@/utils/security";
import {
  getWorklogDataBySprintId,
  getWorklogsByIssueID,
} from "@/services/jira/worklog";

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
      const sprintId = req.query.sprintId;
      if (!sprintId) {
        return res.status(400).json({ message: "Please provide sprintID" });
      }
      const { baseURL, token } = decryptData<{
        baseURL: string;
        token: string;
      }>(authToken);
      const jiraWorklog = await getWorklogDataBySprintId(Number(sprintId), {
        baseURL,
        headers: { Authorization: token },
      });
      res.status(200).json(jiraWorklog);
    } catch (err: any) {
      return res.status(400).json({ message: "Failed" });
    }
  }
  res.status(404).json({ message: "API Not Found :>" });
}
