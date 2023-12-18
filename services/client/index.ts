export type TServiceClientRequest<T = any> = {
  onLoading?: (isLoading: boolean) => void;
  onFinish?: (data: T) => void;
};
