import { TJiraIssue, TJiraIssueLinkType } from "@/types/jira/issue.type";
import { uniqueArr } from "../array-to-dictionary";
import { TDic } from "@/types";

type TIssueTreeItem = {
  issueId: string;
  children: TIssueTreeItem[];
};
type TIssueDic = TDic<TJiraIssue>;

export const drawIssueTree = (issues: TJiraIssue[]) => {
  const treeByIssueLink: any = {};
  issues.forEach((i) => {
    i.fields.issuelinks.forEach((l) => {
      !treeByIssueLink[l.type.id] && (treeByIssueLink[l.type.id] = []);
    });
  });
};
