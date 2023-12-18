import { TBoardJira, TSprintJira, TUserJira } from "@/types/jira";
import { TJiraIssueType, TJiraStatus } from "@/types/jira/issue.type";
import React from "react";

const JiraContext = React.createContext<{
  user: TUserJira | null;
  board: TBoardJira | null;
  currentSprint: TSprintJira | null;
  issuetype: TJiraIssueType[];
  setData: (state: Partial<TJiraProviderState>) => void;
}>({
  user: null,
  board: null,
  currentSprint: null,
  issuetype: [],
  setData: () => null,
});

export type TJiraProviderState = {
  user: TUserJira | null;
  board: TBoardJira | null;
  currentSprint: TSprintJira | null;
  issuetype: TJiraIssueType[];
  loading: boolean;
};

const JiraProvider: React.FC<{
  children: React.ReactElement[] | React.ReactElement;
  required?: boolean;
  user: TJiraProviderState["user"];
  board: TJiraProviderState["board"];
  issuetype: TJiraProviderState["issuetype"];
  currentSprint: TJiraProviderState["currentSprint"];
  setData: (state: Partial<TJiraProviderState>) => void;
}> = ({ children, required, ...values }) => {
  return <JiraContext.Provider value={values}>{children}</JiraContext.Provider>;
};

export default JiraProvider;
export const useJiraUser = () => React.useContext(JiraContext);
