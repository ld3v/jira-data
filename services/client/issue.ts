import { notification } from "antd";
import { TServiceClientRequest } from ".";
import $http from "@/utils/request";

export async function getTODOStoriesByBoardId(
  {
    boardId,
    statuses,
    ...params
  }: {
    boardId: number;
    storyIssueType?: number | string;
    statuses?: string[];
  },
  options?: TServiceClientRequest
) {
  const { onFinish, onLoading } = options || {};
  onLoading?.(true);
  try {
    const res = await $http.get(`/api/board/${boardId}/todo-stories`, {
      params: {
        statuses:
          Array.isArray(statuses) && statuses.length > 0
            ? statuses.join(",")
            : undefined,
        ...params,
      },
    });
    onFinish?.(res.data.issues);
  } catch (err: any) {
    notification.error({
      message: err.response?.data?.message || err.message || "Unknown error!",
    });
  } finally {
    onLoading?.(false);
  }
}
