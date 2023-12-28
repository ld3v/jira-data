import { JIRA_API } from "@/helper/jira.request";
import $http from "@/utils/request";
import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import { decryptData } from "@/utils/security";
import { TIssuePagination } from "@/types/jira/issue.type";

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
      const boardId = req.query.id || defaultBoardId;
      if (!boardId) {
        return res.status(400).json({ message: "Please provide your boardId" });
      }
      const sprintId = req.query.sprintId as string;
      const issueType = req.query.issueType as string;
      const subIssueType = req.query.subIssueType as string;
      const statuses = (req.query.statuses as string)?.split(",");

      const parent = issueType
        ? await $http.get<TIssuePagination>(
            JIRA_API.issue.ALL_ISSUES(Number(boardId), {
              issueType: issueType || "Story",
              sprintId,
            }),
            {
              headers: { Authorization: token },
              baseURL,
            }
          )
        : null;
      const jiraSubIssues = await $http.get(
        JIRA_API.issue.ALL_ISSUES(Number(boardId), {
          issueType: subIssueType || "Story",
          sprintId,
          statuses,
          parent: parent ? parent.data.issues.map((i) => i.id) : undefined,
        }),
        {
          headers: { Authorization: token },
          baseURL,
        }
      );
      return res.status(200).json(jiraSubIssues.data);
    } catch (err: any) {
      return res.status(400).json({
        message: "Failed",
        details: err.response?.data?.errorMessages || [],
      });
    }
  }
}
