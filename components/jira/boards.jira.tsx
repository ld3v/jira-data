import { useJira } from "@/context/jira";
import { arrayToDictionary } from "@/helper/array-to-dictionary";
import useSelectOptions from "@/hooks/use-select-options";
import { getBoards } from "@/services/client/board";
import { getSprintsByBoardId } from "@/services/client/sprint";
import $http from "@/utils/request";
import { Button, Card, Checkbox, Form, Select, notification } from "antd";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface IJiraBoards {
  className?: string;
  show?: boolean;
}

export type TJiraBoardsRef = {
  fetchBoards: () => Promise<void>;
  fetchSprints: () => Promise<void>;
  resetBoards: () => void;
};

const InternalJiraBoards = forwardRef<TJiraBoardsRef, IJiraBoards>(
  ({ className, show = true }, ref) => {
    const [form] = Form.useForm();

    const [saving, setSaving] = useState<boolean>(false);
    const { user, board, sprint, setData } = useJira();
    const [boardOptions] = useSelectOptions(
      board.items,
      "id",
      ({ location, name }) => (
        <span>
          <span className="text-gray-400">
            {location.projectName || "<no-project>"}
          </span>
          {" · "}
          {name}
        </span>
      )
    );

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

    const getSprints = () =>
      getSprintsByBoardId(
        { boardId: board.selected },
        {
          onFinish: (d) => setData({ cmd: "sprint", payload: { items: d } }),
          onLoading: (d) => setData({ cmd: "sprint", payload: { loading: d } }),
        }
      );
    const fetchBoards = () =>
      getBoards({
        onFinish: (d) => setData({ cmd: "board", payload: { items: d } }),
        onLoading: (d) => setData({ cmd: "board", payload: { loading: d } }),
      });

    useImperativeHandle(ref, () => ({
      fetchBoards,
      fetchSprints: () => getSprints(),
      resetBoards: () => {
        setData({ cmd: "board", payload: { items: [], selected: undefined } });
      },
    }));

    useEffect(() => {
      getSprints();
    }, [board.selected]);

    const handleSelectBoard = async (boardIdSelected: number) => {
      const isSetAsDefault = form.getFieldValue("default");
      setData({ cmd: "board", payload: { selected: boardIdSelected } });
      await saveBoardAsDefault(isSetAsDefault);
    };

    if (!user || !show) return null;

    return (
      <Card className={className}>
        <Form
          form={form}
          initialValues={{
            board: board.selected,
            sprint: sprint.selected,
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
                loading={board.loading}
                placeholder="Select a board"
                className="w-[calc(100%-40px)]"
                onChange={handleSelectBoard}
              />
            </Form.Item>

            <Button
              className="ml-2"
              type="link"
              onClick={fetchBoards}
              disabled={board.loading}
            >
              sync
            </Button>
          </div>
          <Form.Item name="default" valuePropName="checked" noStyle>
            <Checkbox
              onChange={({ target }) => saveBoardAsDefault(target.checked)}
              disabled={saving || board.loading}
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
