import { TAuthorJira, TPaginationJira } from '.';

export type TWorklogPagination = Omit<TPaginationJira<TWorklog>, 'values'> & {
  worklogs: TWorklog[];
};

export type TWorklog = {
  self: string;
  author: TAuthorJira;
  updateAuthor: TAuthorJira;
  comment: string;
  updated: string;
  visibility: {
    type: 'group' | string;
    value: string;
    identifier: string;
  };
  started: string; // DATE
  timeSpent: string; // 3h 20m
  timeSpentSeconds: number;
  id: string; // '123456'
  issueId: string; // '10024
};

export type TWorklogResponse = {
  key: string; // issueKey, Ex: APM-1234
  summary: string;
  worklogs: {
    id: TWorklog['id'];
    author: {
      accountId: TAuthorJira['accountId'];
      displayName: TAuthorJira['displayName'];
    };
    secondsSpent: number;
    time: TWorklog['started'];
  }[];
  issueType: string;
  status?: string;
  originalEstimateSeconds?: number;
  remainingEstimateSeconds?: number;
  timeSpentSeconds?: number;
};
