import { arrayToDictionary } from "@/helper/array-to-dictionary";
import { JIRA_API } from "@/helper/jira.request";
import { TIssuePagination, TJiraIssue } from "@/types/jira/issue.type";
import $http from "@/utils/request";
import { AxiosRequestConfig } from "axios";

export async function getWorklogDataByBoardId(
  boardId: number,
  issuetypeSubImp: number | string,
  storyIds: (number | string)[],
  options: AxiosRequestConfig
): Promise<{
  story: Record<
    TJiraIssue["key"],
    TJiraIssue & {
      subImplAssigned: TJiraIssue["key"][];
      subImplUnassigned: TJiraIssue["key"][];
    }
  >;
  subImplAssigned: Record<TJiraIssue["key"], TJiraIssue>;
  subImplUnassigned: Record<TJiraIssue["key"], TJiraIssue>;
}> {
  try {
    const issueData = await $http.get<TIssuePagination>(
      JIRA_API.issue.BY_PARENTS_AND_TYPE(boardId, issuetypeSubImp, storyIds),
      options
    );

    // Calculate data
    let story: Record<
      TJiraIssue["key"],
      TJiraIssue & {
        subImplAssigned: TJiraIssue["key"][];
        subImplUnassigned: TJiraIssue["key"][];
      }
    > = {};
    const subImplAssigned: Record<TJiraIssue["key"], TJiraIssue> = {};
    const subImplUnassigned: Record<TJiraIssue["key"], TJiraIssue> = {};

    const storyIdFound: TJiraIssue["id"][] = [];
    issueData.data.issues.forEach((issue) => {
      const issueParent = issue.fields.parent;
      if (!story[issueParent.key]) {
        storyIdFound.push(issueParent.id);
        story[issueParent.key] = {
          ...issueParent,
          subImplAssigned: [],
          subImplUnassigned: [],
        };
      }

      if (issue.fields.assignee) {
        // Sub-Impl assigned
        subImplAssigned[issue.key] = issue;
        story[issueParent.key].subImplAssigned.push(issue.key);
      } else {
        // Sub-Impl unassigned
        subImplUnassigned[issue.key] = issue;
        story[issueParent.key].subImplUnassigned.push(issue.key);
      }
    });

    const missingStoryIds = storyIds.filter(
      (sId) => !storyIdFound.includes(`${sId}`)
    );
    if (missingStoryIds.length > 0) {
      const missingStoryData = await $http.get<TIssuePagination>(
        JIRA_API.issue.BY_ISSUES(boardId, missingStoryIds),
        options
      );
      const { dic: missingStoryDic } = arrayToDictionary(
        missingStoryData.data.issues,
        "key",
        { subImplAssigned: [], subImplUnassigned: [] }
      );

      story = { ...story, ...missingStoryDic };
    }

    return {
      story,
      subImplAssigned,
      subImplUnassigned,
    };
  } catch (error) {
    console.error(`Error when get data by board#${boardId}:`, error);
    throw error;
  }
}
