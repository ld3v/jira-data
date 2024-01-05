import $http from "@/utils/request";
import { TServiceClientRequest } from ".";
import { notification } from "antd";
import dayjs from "dayjs";

export async function addWorklogByIssueKey(
  {
    key,
    date,
    secs,
  }: {
    key: string | number;
    date: string;
    secs: number;
  },
  options?: TServiceClientRequest
) {
  const { onFinish, onLoading } = options || {};
  onLoading?.(true);
  try {
    const res = await $http.post(`/api/worklog/log`, {
      issue: key,
      timeSpent: secs,
      startedAt: dayjs(date, "DD/MM/YYYY")
        .set("hour", 8)
        .set("minute", 30)
        .set("second", 0)
        .set("millisecond", 0)
        .format("YYYY-MM-DD[T]HH:mm:ss.SSSZZ"),
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
