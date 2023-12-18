import { TAuthorJira } from ".";
import { TJiraIssue, TJiraTimeTracking } from "./issue.type";

export type TWorkloadSummary = {
  story: Record<
    TJiraIssue["key"],
    TJiraIssue & {
      subImplAssigned: TJiraIssue["key"][];
      subImplUnassigned: TJiraIssue["key"][];
    }
  >;
  subImplAssigned: Record<TJiraIssue["key"], TJiraIssue>;
  subImplUnassigned: Record<TJiraIssue["key"], TJiraIssue>;
};

export type TWorkloadByAssignee = {
  accountId: TAuthorJira["accountId"];
  displayName: TAuthorJira["displayName"];
  workload: number;
  tickets: { key: TJiraIssue["key"]; timetracking: TJiraTimeTracking }[];
};
