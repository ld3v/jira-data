import { useJiraUser } from "@/context/jira";
import { TBoardJira, TSprintJira } from "@/types/jira";
import $http from "@/utils/request";
import { Button, Card, Checkbox, Form, Select, notification } from "antd";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

export interface IJiraBoards {
  className?: string;
}

export type TJiraBoardsRef = {
  fetchBoards: () => Promise<void>;
  resetBoards: () => void;
};

const InternalJiraBoards = forwardRef<TJiraBoardsRef, IJiraBoards>(
  ({ className }, ref) => {
    const [form] = Form.useForm();

    const [boards, setBoards] = useState<TBoardJira[]>([]);
    const [saving, setSaving] = useState<boolean>(false);
    const { user, board, currentSprint, setData } = useJiraUser();
    const boardOptions = useMemo(
      () =>
        boards.map((b) => ({
          value: b.id,
          label: (
            <span>
              <span className="text-gray-400">
                {b.location.projectName || "<no-project>"}
              </span>
              {" · "}
              {b.name}
            </span>
          ),
        })),
      [boards]
    );
    const [loading, setLoading] = useState<boolean>(false);

    const getBoards = async () => {
      setLoading(true);
      try {
        const res = await $http.get("/api/boards");
        setBoards(res.data.values);
      } catch (err: any) {
        notification.error({ message: err.message });
      } finally {
        setLoading(false);
      }
    };
    const saveBoardAsDefault = async (isDefault: boolean) => {
      const boardId = form.getFieldValue("board");
      if (!boardId) {
        notification.error({
          message: "Please select a board to set as default",
        });
        form.setFieldValue("default", false);
        return;
      }
      setSaving(true);
      try {
        await $http.patch("/api/boards", {
          boardId: isDefault ? boardId : undefined,
        });
      } catch (err: any) {
        notification.error({ message: err.message });
      } finally {
        setSaving(false);
      }
    };

    useImperativeHandle(ref, () => ({
      fetchBoards: getBoards,
      resetBoards: () => {
        setBoards([]);
      },
    }));

    useEffect(() => {
      getBoards();
    }, []);

    const handleSelectBoard = async (boardIdSelected: number) => {
      const isSetAsDefault = form.getFieldValue("default");
      setData({ board: boards.find((b) => b.id === boardIdSelected) });
      await saveBoardAsDefault(isSetAsDefault);
    };

    if (!user) return null;

    return (
      <Card className={className}>
        <Form
          form={form}
          initialValues={{
            board: board?.id,
            sprint: currentSprint?.id,
            default: !!board,
          }}
        >
          <div className="flex items-center mb-1">
            <Form.Item
              name="board"
              rules={[
                {
                  required: true,
                  message: "Please select a JIRA board to continue",
                },
              ]}
              noStyle
            >
              <Select
                options={boardOptions}
                loading={loading}
                placeholder="Select a board"
                className="w-[calc(100%-40px)]"
                onChange={handleSelectBoard}
              />
            </Form.Item>

            <Button
              className="ml-2"
              type="link"
              onClick={() => getBoards()}
              disabled={loading}
            >
              sync
            </Button>
          </div>
          <Form.Item name="default" valuePropName="checked" noStyle>
            <Checkbox
              onChange={({ target }) => saveBoardAsDefault(target.checked)}
              disabled={saving || loading}
            >
              Set as default {saving && "(saving...)"}
            </Checkbox>
          </Form.Item>
        </Form>
      </Card>
    );
  }
);

InternalJiraBoards.displayName = "JiraBoards";

export default InternalJiraBoards;
