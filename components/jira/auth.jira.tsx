import { useJira } from "@/context/jira";
import { TUserJira } from "@/types/jira";
import $http from "@/utils/request";
import {
  Alert,
  Button,
  Card,
  Form,
  FormProps,
  Input,
  message,
  notification,
} from "antd";
import React, { useState } from "react";

export interface IAuthCard {
  className?: string;
  showUserInfo?: boolean;
  onGotUser?: (data: TUserJira) => Promise<void> | void;
  onResetUser?: () => void;
}

export type TAuthRef = {};

type TInternalFormValues = {
  baseURL: string;
  username: string;
  accessToken: string;
  remember: boolean;
};

const InternalAuthCard: React.FC<IAuthCard> = ({
  className,
  showUserInfo = true,
  onResetUser,
  onGotUser,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { user, setData } = useJira();
  const [form] = Form.useForm();
  const handleSubmit: FormProps<TInternalFormValues>["onFinish"] = async ({
    baseURL,
    username,
    accessToken,
  }) => {
    try {
      setLoading(true);
      const res = await $http.post(
        "/api/me",
        {
          baseURL: `https://${baseURL}`,
          remember: true,
        },
        {
          auth: {
            username,
            password: accessToken,
          },
        }
      );
      setData({ cmd: "user", payload: res.data });
      onGotUser?.(res.data);
      form.resetFields();
    } catch (err: any) {
      notification.error({
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setLoading(false);
    }
  };
  const handleReset = async () => {
    await $http.post("/api/reset");
    form.resetFields();
    onResetUser?.();
    message.info("Reload this page after 5s");
    setTimeout(() => location.reload(), 5000);
  };

  if (user) {
    if (!showUserInfo) return null;
    return (
      <Alert
        message={
          <span>
            You are already logged-in as <b>{user.displayName}</b>
          </span>
        }
        className={className}
        action={
          <Button type="dashed" onClick={() => handleReset()}>
            use another
          </Button>
        }
      />
    );
  }

  return (
    <Card className={className} loading={loading}>
      <Form<TInternalFormValues> form={form} onFinish={handleSubmit}>
        <Form.Item
          name="baseURL"
          rules={[{ required: true, message: "Please enter your JIRA URL" }]}
        >
          <Input placeholder="something.atlassian.net" prefix="https://" />
        </Form.Item>
        <div className="block md:flex gap-0 md:gap-5">
          <div className="w-full md:w-[calc(50%-10px)]">
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please enter your JIRA username",
                },
              ]}
            >
              <Input placeholder="JIRA USR" />
            </Form.Item>
          </div>
          <div className="w-full md:w-[calc(50%-10px)]">
            <Form.Item
              name="accessToken"
              rules={[
                { required: true, message: "Please enter your JIRA token" },
              ]}
            >
              <Input.Password placeholder="JIRA USR" />
            </Form.Item>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button htmlType="submit" type="dashed">
            Submit
          </Button>
        </div>
      </Form>
      <div className="italic text-gray-400">
        Your username & access token will be store on <b>your browser only</b>{" "}
        (cookie).
        <br />
        To protect these information, we will <b>encrypt</b> them to protect
        yourself.
      </div>
    </Card>
  );
};

export default InternalAuthCard;
