import { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import { decryptData } from "@/utils/security";
import { addWorklog } from "@/services/jira/worklog";
import { validate } from "@/helper/validate";
import Joi from "joi";

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
  if (req.method === "POST") {
    try {
      const { baseURL, token } = decryptData<{
        baseURL: string;
        token: string;
      }>(authToken);
      const isErr = validate({
        issue: Joi.string().required(),
        timeSpent: Joi.number().min(0).required(),
        comment: Joi.string().optional(),
        startedAt: Joi.string().required(),
      })(req.body);
      if (isErr) {
        return res
          .status(400)
          .json({ message: "Something not OK", error: isErr });
      }
      const newWorklog = await addWorklog(
        req.body.issue as string,
        {
          started: req.body.startedAt as string,
          timeSpentSeconds: req.body.timeSpent as number,
          comment: req.body.comment as string,
        },
        {
          headers: { Authorization: token },
          baseURL,
        }
      );
      return res.status(200).json({ worklog: newWorklog });
    } catch (err: any) {
      return res.status(400).json({ message: "Failed " });
    }
  }
}
