import { JIRA_API } from "@/helper/jira.request";
import { TIssuePagination } from "@/types/jira/issue.type";
import $http from "@/utils/request";
import { AxiosRequestConfig } from "axios";
import { TSummaryIssueData } from "./worklog";
import { TAuthorJira, TWorkloadResponse } from "@/types/jira";

export type TSummaryWorkload = TAuthorJira & {
  totalSecs: number;
  details: {
    [issueKey: string]: number;
  };
};
export type TSummaryWorkloadDataByAccount = {
  [accountId: string]: TSummaryWorkload | undefined;
};

export async function getWorkloadDataBySprintId(
  sprintId: number | string,
  filterOptions: { issueTypes?: string[]; parentIds?: string[] },
  options: AxiosRequestConfig
): Promise<{
  workloadData: TSummaryWorkloadDataByAccount;
  issueData: TSummaryIssueData;
}> {
  try {
    const issuePagination = await $http.get<TIssuePagination>(
      JIRA_API.workload.BY_SPRINT(sprintId, filterOptions),
      options
    );

    // Calculate data
    const workloadByIssues: TWorkloadResponse[] =
      issuePagination.data.issues.map((issue) => ({
        id: issue.id,
        key: issue.key,
        summary: issue.fields.summary,
        duedate: issue.fields.duedate,
        assignee: issue.fields.assignee,
        issueType: issue.fields.issuetype?.name,
        status: issue.fields.status ? issue.fields.status.name : undefined,
        originalEstimateSeconds:
          issue.fields.timetracking.originalEstimateSeconds,
        remainingEstimateSeconds:
          issue.fields.timetracking.remainingEstimateSeconds,
        timeSpentSeconds: issue.fields.timetracking.timeSpentSeconds,
      }));

    return summaryWorklogByWorklogData(workloadByIssues);
  } catch (error) {
    console.error(`Error when get worklogs by sprint#${sprintId}:`, error);
    throw error;
  }
}
function summaryWorklogByWorklogData(issues: TWorkloadResponse[]): {
  workloadData: TSummaryWorkloadDataByAccount;
  issueData: TSummaryIssueData;
} {
  // Filter
  const workloadData: {
    [accountId: string]: TSummaryWorkload;
  } = {};
  const unAssignee: (string | number)[] = [];
  const issueData: TSummaryIssueData = issues.map((i) => {
    if (!i.assignee) {
      unAssignee.push(i.id);
    } else {
      if (!workloadData[i.assignee.accountId]) {
        workloadData[i.assignee.accountId] = {
          ...i.assignee,
          totalSecs: 0,
          details: {},
        };
      }
      workloadData[i.assignee.accountId].totalSecs +=
        i.originalEstimateSeconds || 0;
      workloadData[i.assignee.accountId].details[i.id] =
        i.originalEstimateSeconds || 0;
    }

    return {
      key: i.key,
      summary: i.summary,
      assignee: i.assignee,
      duedate: i.duedate,
      originalEstimateSeconds: i.originalEstimateSeconds || 0,
      remainingEstimateSeconds: i.remainingEstimateSeconds || 0,
      timeSpentSeconds: i.timeSpentSeconds || 0,
    };
  });

  return {
    issueData,
    workloadData,
  };
}
