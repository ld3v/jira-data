export * from "./user.type";
export * from "./board.type";
export * from "./sprint.type";
export * from "./worklog.type";
export * from "./workload.type";

export type TPaginationJira<T> = {
  maxResults: number;
  startAt: number;
  total: number;
  isLast: boolean;
  values: T[];
};
