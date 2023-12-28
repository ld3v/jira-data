import { useJira } from "@/context/jira";
import { drawIssueTree } from "@/helper/calc/order-issues";
import { validate } from "@/helper/validate";
import useSelectOptions from "@/hooks/use-select-options";
import useStates from "@/hooks/use-states";
import { getIssueByBoardAndIssueType } from "@/services/client/issue";
import { TJiraIssueType } from "@/types/jira/issue.type";
import {
  Alert,
  Button,
  Col,
  Collapse,
  Form,
  FormProps,
  Row,
  Select,
} from "antd";
import Joi from "joi";
import { useMemo } from "react";

type TFormSearchStory = {
  storyIssueType: string | number;
  subImplIssueType: string | number;
  statuses: string[];
};

const TaskPriority = () => {
  const { board, sprint, issuetype, getData } = useJira();
  const [sprintOptions] = useSelectOptions(
    sprint.items,
    "id",
    ({ name, state }) => (
      <span>
        <span className="text-gray-400">{name}</span>
        {" · "}
        {state}
      </span>
    )
  );
  const [issuetypeOptions, issuetypeDic] = useSelectOptions<TJiraIssueType>(
    issuetype.items,
    "id",
    "name",
    (a, b) => b.hierarchyLevel - a.hierarchyLevel
  );
  const [{ loadingTasks, parentIssueType, tasks }, setStates] = useStates<{
    loadingTasks: boolean;
    parentIssueType?: TJiraIssueType["id"];
    tasks: any[];
  }>({ loadingTasks: false, tasks: [] });
  const childIssueTypeOptions = useMemo(
    () =>
      issuetypeOptions.map(({ value, label, disabled }) =>
        parentIssueType &&
        value &&
        issuetypeDic[parentIssueType].hierarchyLevel <=
          issuetypeDic[value].hierarchyLevel
          ? { value, label, disabled: true }
          : { value, label, disabled }
      ),
    [parentIssueType]
  );

  const [form] = Form.useForm();

  if (!board.selected) {
    return (
      <Alert
        type="error"
        showIcon
        message="Please select a board to view this!"
      />
    );
  }

  const handleGetIssues: FormProps["onFinish"] = ({
    sprintId,
    issueType,
    subIssueType,
  }) =>
    board && board.selected
      ? getIssueByBoardAndIssueType(
          {
            boardId: board.selected,
            sprintId,
            issueType,
            subIssueType,
          },
          {
            onLoading: (s) => setStates({ loadingTasks: s }),
            onFinish: (d) => {
              setStates({ tasks: d });
            },
          }
        )
      : null;

  drawIssueTree(tasks);
  return (
    <>
      <Form<TFormSearchStory>
        form={form}
        layout="vertical"
        initialValues={{ sprintId: sprint.selected }}
        onFinish={handleGetIssues}
        className="mb-3"
      >
        <Row className="w-full" gutter={[24, 24]}>
          <Col span={8}>
            <Form.Item
              name="sprintId"
              label="Sprint"
              rules={[{ required: true, message: "Please select a sprint" }]}
            >
              <Select options={sprintOptions} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="issueType"
              label="Issue type"
              rules={[
                { required: true, message: "Please select an issue-type" },
              ]}
            >
              <Select
                className="w-full"
                options={issuetypeOptions}
                placeholder="Story"
                showSearch
                filterOption={(keyword, option) => {
                  if (!option || !option.value) return false;
                  const optionItem = issuetypeDic[option.value];
                  if (
                    optionItem?.name
                      .toLowerCase()
                      .includes(keyword.toLowerCase())
                  )
                    return true;
                  return false;
                }}
                onChange={(s) => setStates({ parentIssueType: s })}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="subIssueType"
              label="Sub Issue Type"
              rules={[
                {
                  required: true,
                  message: "Please select issue-type for sub!",
                },
              ]}
            >
              <Select
                className="w-full"
                options={childIssueTypeOptions}
                placeholder="Sub-Imp"
                showSearch
                filterOption={(keyword, option) => {
                  if (!option || !option.value) return false;
                  const optionItem = issuetypeDic[option.value];
                  if (
                    optionItem?.name
                      .toLowerCase()
                      .includes(keyword.toLowerCase())
                  )
                    return true;
                  return false;
                }}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="&nbsp;">
              <Button block htmlType="submit">
                Get issues
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Collapse
        items={Object.keys(parent).map((sId) => ({
          key: sId,
          label: <>{/* {dic[sId].key} · {dic[sId].fields.summary} */}</>,
          children: null,
        }))}
      />
    </>
  );
};

export default TaskPriority;
