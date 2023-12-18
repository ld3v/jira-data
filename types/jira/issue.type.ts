import { TAuthorJira, TPaginationJira } from ".";
import { TWorklogPagination } from "./worklog.type";

export type TIssuePagination = Omit<TPaginationJira<TJiraIssue>, "values"> & {
  issues: TJiraIssue[];
};
export type TJiraIssue = {
  expand: string;
  id: string; // '222132'
  self: string;
  key: string; // 'APM-2678'
  fields: {
    summary: string;
    parent: TJiraIssue;
    status: TJiraStatus;
    priority: TJiraPriority;
    worklog: TWorklogPagination;
    timetracking: TJiraTimeTracking;
    issuetype: TJiraIssueType;
    assignee: TAuthorJira;
    subtasks: TJiraIssue[];
  };
};

export type TJiraIssueStory = TJiraIssue & { issues: TJiraIssue["id"][] };

export type TJiraPriority = {
  self: string;
  iconUrl: string;
  name: string;
  id: string; // '3'
};

export type TJiraStatus = {
  self: string;
  description: string;
  iconUrl: string;
  name: string; // 'In QA'
  id: string; // '10510'
  statusCategory: {
    self: string;
    id: number;
    key: string;
    colorName: string;
    name: string; // 'In Progress'
  };
};

export type TJiraTimeTracking = {
  originalEstimate: string; // '10m'
  remainingEstimate: string; // '3m'
  timeSpent: string; // '6m'
  originalEstimateSeconds: number;
  remainingEstimateSeconds: number;
  timeSpentSeconds: number;
};

export type TJiraIssueType = {
  self: string;
  id: string; // '10380'
  description: string;
  iconUrl: string;
  name: string;
  subtask: boolean;
  avatarId: number;
  hierarchyLevel: number;
};

export type TStoryTodo = {
  id: TJiraIssue["id"];
  key: TJiraIssue["key"];
  summary: TJiraIssue["fields"]["summary"];
  timetracking: TJiraIssue["fields"]["timetracking"];
};
