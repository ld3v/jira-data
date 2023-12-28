import { notification } from "antd";
import { TServiceClientRequest } from ".";
import $http from "@/utils/request";

export async function getBoards(options?: TServiceClientRequest) {
  const { onFinish, onLoading } = options || {};
  onLoading?.(true);
  try {
    const res = await $http.get("/api/boards");
    onFinish?.(res.data.values);
  } catch (err: any) {
    notification.error({
      message: err.response?.data?.message || err.message || "Unknown error!",
    });
  } finally {
    onLoading?.(false);
  }
}
