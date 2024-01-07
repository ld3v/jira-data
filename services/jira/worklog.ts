import { JIRA_API } from "@/helper/jira.request";
import { TWorklog, TWorklogPagination, TWorklogResponse } from "@/types/jira";
import { TIssuePagination } from "@/types/jira/issue.type";
import $http from "@/utils/request";
import { AxiosRequestConfig } from "axios";
import dayjs from "dayjs";

export type TSummaryWorklog = {
  accountId: string;
  name: string;
  secsSpent: number;
  details: { [issueKey: string]: number };
};
export type TSummaryWorklogDataByDate = {
  [date: string]: {
    [accountId: string]: TSummaryWorklog | undefined;
  };
};
export type TSummaryWorklogDataByAccount = {
  [accountId: string]: {
    [date: string]: TSummaryWorklog | undefined;
  };
};

export type TSummaryIssueData = {
  key: string;
  summary: string;
  originalEstimateSeconds: number;
  remainingEstimateSeconds: number;
  timeSpentSeconds: number;
  duedate: string;
}[];

export async function getWorklogsByIssueID(
  issueIds: (number | string)[],
  options: AxiosRequestConfig
) {
  try {
    const errors: Error[] = [];
    const promises = issueIds.map(async (id) => {
      try {
        const worklogByIssue = await $http.get<TWorklogPagination>(
          JIRA_API.worklog.BY_ISSUE(id),
          options
        );
        return {
          issueId: id,
          worklogs: worklogByIssue.data.worklogs,
        };
      } catch (error: any) {
        errors.push(error);
        return null;
      }
    });
    const result: Record<number | string, TWorklog[]> = {};
    const data = await Promise.all(promises);
    if (errors.length > 0) {
      console.error("Error when get worklogs by issues:", errors);
      throw new Error("Got some errors when trying to get worklogs by issue");
    }

    (data as { issueId: string | number; worklogs: TWorklog[] }[])
      .filter((i) => i)
      .forEach((dataItem) => {
        result[dataItem.issueId] = dataItem.worklogs;
      });

    return result;
  } catch (error) {
    console.error(
      `Error when get worklogs by issue IDs[${issueIds.join(",")}]:`,
      error
    );
    throw error;
  }
}

export async function addWorklog(
  issueKey: number | string,
  payload: {
    comment?: string;
    started?: string;
    timeSpentSeconds: number;
  },
  options: AxiosRequestConfig
): Promise<TWorklog> {
  try {
    const worklogInfo = await $http.post<TWorklog>(
      JIRA_API.worklog.ADD(issueKey),
      payload,
      options
    );

    return worklogInfo.data;
  } catch (error) {
    console.error(
      `Error when add worklog for issue#${issueKey}:`,
      payload,
      error
    );
    throw error;
  }
}
export async function getWorklogDataBySprintId(
  sprintId: number | string,
  options: AxiosRequestConfig
): Promise<{
  worklogData: TSummaryWorklogDataByDate;
  issueData: TSummaryIssueData;
}> {
  try {
    const issuePagination = await $http.get<TIssuePagination>(
      JIRA_API.worklog.BY_SPRINT(sprintId),
      options
    );
    // Filter data
    const issuesHaveWorklogOutRangeIds = issuePagination.data.issues
      .filter((i) => i.fields.worklog.total > i.fields.worklog.maxResults)
      .map((i) => i.id);
    const worklogByIssueOutRange = await getWorklogsByIssueID(
      issuesHaveWorklogOutRangeIds,
      options
    );

    // Calculate data
    const worklogByIssues: Record<string, TWorklogResponse> = {};
    issuePagination.data.issues.forEach((issue) => {
      if (!worklogByIssues[issue.id]) {
        worklogByIssues[issue.id] = {
          key: issue.key,
          summary: issue.fields.summary,
          worklogs: [],
          issueType: issue.fields.issuetype?.name,
          status: issue.fields.status ? issue.fields.status.name : undefined,
          originalEstimateSeconds:
            issue.fields.timetracking.originalEstimateSeconds,
          remainingEstimateSeconds:
            issue.fields.timetracking.remainingEstimateSeconds,
          timeSpentSeconds: issue.fields.timetracking.timeSpentSeconds,
          duedate: issue.fields.duedate,
        };
      }

      if (issue.fields.worklog.total === 0) return;
      const worklogs =
        issue.fields.worklog.total > issue.fields.worklog.maxResults
          ? worklogByIssueOutRange[issue.id]
          : issue.fields.worklog.worklogs;
      worklogByIssues[issue.id].worklogs = worklogs.map((wkl) => ({
        id: wkl.id,
        author: {
          accountId: wkl.author.accountId,
          displayName: wkl.author.displayName,
        },
        secondsSpent: wkl.timeSpentSeconds,
        time: wkl.started,
      }));
    });
    const worklogs = Object.values(worklogByIssues);

    return summaryWorklogByWorklogData(worklogs);
  } catch (error) {
    console.error(`Error when get worklogs by sprint#${sprintId}:`, error);
    throw error;
  }
}
function summaryWorklogByWorklogData(issues: TWorklogResponse[]): {
  worklogData: TSummaryWorklogDataByDate;
  issueData: TSummaryIssueData;
} {
  // Filter
  const worklogData: TSummaryWorklogDataByDate = {};
  const issueData: TSummaryIssueData = issues.map((i) => {
    i.worklogs.forEach((wkl) => {
      const date = dayjs(new Date(wkl.time)).format("DD/MM/YYYY");
      if (!worklogData[date]) worklogData[date] = {};
      if (!worklogData[date][wkl.author.accountId]) {
        worklogData[date][wkl.author.accountId] = {
          accountId: wkl.author.accountId,
          name: wkl.author.displayName,
          secsSpent: wkl.secondsSpent,
          details: {
            [i.key]: wkl.secondsSpent,
          },
        };
        return;
      }
      const wklInfo = worklogData[date][
        wkl.author.accountId
      ] as TSummaryWorklog;
      worklogData[date][wkl.author.accountId] = {
        ...wklInfo,
        secsSpent: wklInfo.secsSpent + wkl.secondsSpent,
        details: {
          ...wklInfo.details,
          [i.key]: (wklInfo.details[i.key] || 0) + wkl.secondsSpent,
        },
      };
    });

    return {
      key: i.key,
      summary: i.summary,
      originalEstimateSeconds: i.originalEstimateSeconds || 0,
      remainingEstimateSeconds: i.remainingEstimateSeconds || 0,
      timeSpentSeconds: i.timeSpentSeconds || 0,
      duedate: i.duedate,
    };
  });

  return {
    worklogData,
    issueData,
  };
}
