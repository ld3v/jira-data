import { JIRA_API } from "@/helper/jira.request";
import $http from "@/utils/request";
import { NextApiRequest, NextApiResponse } from "next";
import { encryptData } from "@/utils/security";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { authorization } = req.headers;
    const { baseURL, remember } = req.body;
    try {
      const jiraData = await $http.get(JIRA_API.user.ME, {
        headers: {
          Authorization: authorization,
        },
        baseURL,
      });
      if (remember) {
        // Cookie will expired after 15d
        const encryptedToken = encryptData(
          JSON.stringify({
            token: authorization,
            baseURL,
          })
        );
        res.setHeader(
          "Set-Cookie",
          `_thinkWith=${encryptedToken}; secure; maxAge=1296000`
        );
      }
      return res.status(200).json(jiraData.data);
    } catch (err: any) {
      console.error(err);
      return res.status(400).json({
        message:
          err?.response?.data?.message ||
          "Unknown error happen when handle your request!",
      });
    }
  }
  res.status(404).json({ message: "API not found!" });
}
