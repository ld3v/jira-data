import $http from "@/utils/request";
import { TServiceClientRequest } from ".";
import { notification } from "antd";

export async function getWorkloadByStories(
  {
    boardId,
    subImplIssueType,
    storyIds,
  }: {
    boardId: number;
    subImplIssueType: string | number;
    storyIds: (number | string)[];
  },
  options?: TServiceClientRequest
) {
  const { onFinish, onLoading } = options || {};
  onLoading?.(true);
  try {
    const res = await $http.get(`/api/board/${boardId}/workload`, {
      params: { storyIds: storyIds.join(","), subImplIssueType },
    });
    onFinish?.(res.data);
  } catch (err: any) {
    notification.error({
      message: err.response?.data?.message || err.message || "Unknown error!",
    });
  } finally {
    onLoading?.(false);
  }
}
