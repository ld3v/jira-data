import Joi from "joi";
import { validate } from "./validate";

const numOrStr = (inp: number | string) =>
  !validate({ inp: Joi.number().required() })({ inp: inp })
    ? (inp as number)
    : `"${inp}"`;

export const JIRA_API = {
  user: {
    ME: "/rest/api/2/myself",
    USER: "/rest/api/2/user",
  },
  board: {
    ALL: "/rest/agile/1.0/board",
    ONE: (boardId: number) => `/rest/agile/1.0/board/${boardId}`,
  },
  sprint: {
    ALL: (boardId: number) => `/rest/agile/1.0/board/${boardId}/sprint`,
    ONE: (sprintId: number) => `/rest/agile/1.0/sprint/${sprintId}`,
  },
  issue: {
    ALL: (sprintId: number) => `/rest/agile/1.0/sprint/${sprintId}/issue`,
    ALL_ISSUE_TYPE: () => `/rest/api/2/issuetype`,
    ALL_ISSUE_TYPE_BY_PRJ: (projectId: string | number) =>
      `/rest/api/2/issuetype/project?projectId=${projectId}`,
    ALL_ISSUES: (
      boardId: number,
      {
        issueType,
        sprintId,
        statuses,
        parent,
      }: {
        issueType: number | string;
        sprintId?: number | string;
        statuses?: string[];
        parent?: string[];
      }
    ) => {
      const jql = [
        sprintId ? `sprint=${sprintId}` : "",
        `issuetype=${numOrStr(issueType)}`,
        statuses
          ? `status in (${statuses.map((s) => numOrStr(s)).join(", ")})`
          : undefined,
        parent
          ? `parent in (${parent.map((s) => numOrStr(s)).join(", ")})`
          : undefined,
      ]
        .filter((p) => p)
        .join("+AND+");
      console.debug(
        `-- /rest/agile/1.0/board/${boardId}/issue?fields=summary,parent,duedate,timetracking,assignee,status,subtasks,issuelinks&maxResults=500&jql=${jql}`
      );
      return `/rest/agile/1.0/board/${boardId}/issue?fields=summary,parent,duedate,timetracking,assignee,status,subtasks,issuelinks&maxResults=500&jql=${jql}`;
    },
    BY_ISSUES: (boardId: number, issueIds?: (number | string)[]) =>
      `/rest/agile/1.0/board/${boardId}/issue?fields=subtasks,summary,status,timetracking,assignee,issuetype,parent&maxResults=500&jql=${
        issueIds ? `issue in (${issueIds.join(", ")})` : ""
      }`,
    BY_PARENTS_AND_TYPE: (
      boardId: number,
      issueType: number | string,
      parentIds: (number | string)[]
    ) =>
      `/rest/agile/1.0/board/${boardId}/issue?fields=subtasks,summary,status,timetracking,assignee,issuetype,parent&maxResults=500&jql=issuetype=${issueType}+AND+parent in (${parentIds.join(
        ", "
      )})`,
    BY_ISSUES_AND_TYPE: (
      boardId: number,
      issueType: number | string,
      issueIds: (number | string)[]
    ) =>
      `/rest/agile/1.0/board/${boardId}/issue?fields=subtasks,summary,status,timetracking,assignee,issuetype,parent&maxResults=500&jql=issuetype=${issueType}+AND+${
        issueIds ? `issue in (${issueIds.join(", ")})` : ""
      }`,
  },
  worklog: {
    BY_SPRINT: (sprintId: number) =>
      `/rest/agile/1.0/sprint/${sprintId}/issue?fields=worklog,summary,status,priority,timetracking&maxResults=500`,
    BY_ISSUE: (issueId: number | string) =>
      `/rest/api/2/issue/${issueId}/worklog`,
  },
  status: {
    ALL: () => "/rest/api/2/statuses",
  },
};
