import { notification } from "antd";
import { TServiceClientRequest } from ".";
import $http from "@/utils/request";

export async function getTODOStoriesByBoardId(
  {
    boardId,
    ...params
  }: {
    boardId: number;
    storyIssueType?: number | string;
    statusTodo?: number | string;
  },
  options?: TServiceClientRequest
) {
  const { onFinish, onLoading } = options || {};
  onLoading?.(true);
  try {
    const res = await $http.get(`/api/board/${boardId}/todo-stories`, {
      params: { ...params },
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
