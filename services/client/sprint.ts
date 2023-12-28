import { notification } from "antd";
import { TServiceClientRequest } from ".";
import $http from "@/utils/request";
import { TPaginationJira, TSprintJira } from "@/types/jira";

export async function getSprintsByBoardId(
  {
    boardId,
  }: {
    boardId?: number;
  },
  options?: TServiceClientRequest
) {
  if (!boardId) return;

  const { onFinish, onLoading } = options || {};
  onLoading?.(true);
  try {
    const res = await $http.get<TPaginationJira<TSprintJira>>("/api/sprint", {
      params: { boardId: boardId },
    });
    onFinish?.(res.data.values);
  } catch (err: any) {
    notification.error({
      message: err.response?.data?.message || err.message || "Unknown error!",
    });
  } finally {
    onLoading?.(false);
  }
}
