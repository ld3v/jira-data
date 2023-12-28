import { notification } from "antd";
import { TServiceClientRequest } from ".";
import $http from "@/utils/request";

export async function getIssueByBoardAndIssueType(
  {
    boardId,
    statuses,
    ...params
  }: {
    boardId: number;
    issueType?: number | string;
    subIssueType?: number | string;
    sprintId?: number | string;
    statuses?: string[];
  },
  options?: TServiceClientRequest
) {
  const { onFinish, onLoading } = options || {};
  onLoading?.(true);
  try {
    const res = await $http.get(`/api/board/${boardId}/issues`, {
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
