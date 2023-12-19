import { JIRA_API } from "@/helper/jira.request";
import $http from "@/utils/request";
import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import { decryptData } from "@/utils/security";
import Joi from "joi";
import { validate } from "@/helper/validate";
import { getWorklogDataByBoardId } from "@/services/jira/workload";

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
      const subImplIssueType = req.query.subImplIssueType as string;
      const storyIds = ((req.query.storyIds as string) || "").split(",");
      const validErrors = validate({
        boardId: Joi.number().required(),
        subImplIssueType: Joi.alternatives(
          Joi.string(),
          Joi.number()
        ).required(),
        storyIds: Joi.array().required(),
      })({
        boardId,
        subImplIssueType,
        storyIds,
      });

      console.log(" -- ", boardId, " - ", storyIds);
      if (validErrors) {
        return res.status(400).json({ message: validErrors });
      }
      const workloadData = await getWorklogDataByBoardId(
        boardId as number,
        subImplIssueType,
        storyIds,
        {
          headers: {
            Authorization: token,
          },
          baseURL,
        }
      );
      return res.status(200).json(workloadData);
    } catch (err: any) {
      return res.status(400).json({
        message: "Failed",
        details: err.response?.data?.errorMessages || [],
      });
    }
  }
}
