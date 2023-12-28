import * as cookie from "cookie";
import { decryptData } from "@/utils/security";
import { NextApiRequest, NextApiResponse } from "next";
import $http from "@/utils/request";
import { JIRA_API } from "@/helper/jira.request";
import { TBoardJira, TPaginationJira, TSprintJira } from "@/types/jira";
import { TIssuePagination } from "@/types/jira/issue.type";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const authToken = cookie.parse(req.headers.cookie || "")._thinkWith;
    if (!authToken) {
      return res.status(200).json({
        ok: true,
      });
    }
    try {
      const {
        baseURL,
        token,
        defaultValues: { boardId } = {},
      } = decryptData<{
        baseURL: string;
        token: string;
        defaultValues?: { boardId?: number };
      }>(authToken);
      const jiraData = await $http.get(JIRA_API.user.ME, {
        headers: {
          Authorization: token,
        },
        baseURL,
      });

      const boardsData = jiraData.data
        ? await $http.get<TPaginationJira<TBoardJira>>(JIRA_API.board.ALL, {
            headers: {
              Authorization: token,
            },
            baseURL,
          })
        : null;
      const boardData =
        boardId && boardsData
          ? await $http.get<TBoardJira>(JIRA_API.board.ONE(boardId), {
              headers: {
                Authorization: token,
              },
              baseURL,
            })
          : null;
      const issueTypeData = await $http.get(
        boardData
          ? JIRA_API.issue.ALL_ISSUE_TYPE_BY_PRJ(
              boardData.data.location.projectId
            )
          : JIRA_API.issue.ALL_ISSUE_TYPE(),
        {
          headers: {
            Authorization: token,
          },
          baseURL,
        }
      );
      const sprintsData = boardData
        ? await $http.get<TPaginationJira<TSprintJira>>(
            JIRA_API.sprint.ALL(Number(boardId)),
            {
              headers: { Authorization: token },
              baseURL,
            }
          )
        : null;

      return res.status(200).json({
        user: jiraData.data,
        board: boardData ? boardData.data : undefined,
        boards: boardsData ? boardsData.data.values : undefined,
        sprints: sprintsData ? sprintsData.data.values : undefined,
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
