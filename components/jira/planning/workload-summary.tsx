import { useJiraUser } from "@/context/jira";
import useSelectOptions from "@/hooks/use-select-options";
import useStates from "@/hooks/use-states";
import { getTODOStoriesByBoardId } from "@/services/client/issue";
import { getWorkloadByStories } from "@/services/client/workload";
import { TWorkloadSummary } from "@/types/jira";
import { TJiraIssue, TJiraIssueType } from "@/types/jira/issue.type";
import {
  Button,
  Col,
  Form,
  FormProps,
  Input,
  Row,
  Select,
  message,
  notification,
} from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";
import WorkloadInfo from "./workload-info";

type TFormSearchStory = {
  storyIssueType: string | number;
  subImplIssueType: string | number;
  statusTodo: string | number;
};

const PlanningWorkload = () => {
  const router = useRouter();
  const [form] = Form.useForm<TFormSearchStory>();
  const [storyForm] = Form.useForm<{ stories: string[] }>();
  const { board, issuetype } = useJiraUser();
  const [issuetypeOptions, issuetypeDic] = useSelectOptions<TJiraIssueType>(
    issuetype,
    "id",
    "name"
  );
  const [{ loadingStories, loadingWorkload, stories, workload }, setStates] =
    useStates<{
      loadingStories: boolean;
      loadingWorkload: boolean;
      stories: TJiraIssue[];
      workload: TWorkloadSummary | null;
    }>({
      loadingStories: false,
      loadingWorkload: false,
      stories: [],
      workload: null,
    });

  const [storyOptions, storyDic] = useSelectOptions(stories, "id", "key");

  const handleGetTODOStories = (
    storyIssueType: TFormSearchStory["storyIssueType"] = "Story",
    statusTodo: TFormSearchStory["statusTodo"] = "To do",
    callback?: () => void
  ) =>
    board && board.id
      ? getTODOStoriesByBoardId(
          {
            boardId: board.id,
            storyIssueType,
            statusTodo,
          },
          {
            onLoading: (s) => setStates({ loadingStories: s }),
            onFinish: (d) => {
              setStates({ stories: d });
              callback?.();
            },
          }
        )
      : null;

  const handleFormSearchStoriesSubmit: FormProps<TFormSearchStory>["onFinish"] =
    async ({ storyIssueType, statusTodo }) => {
      // Reset query params & stories item
      storyForm.resetFields();
      window.history.replaceState(null, "", router.pathname);
      await handleGetTODOStories(storyIssueType, statusTodo);
    };

  const handleGetStoriesLink = () => {
    const storiesSelected = storyForm.getFieldValue("stories");
    if (!Array.isArray(storiesSelected) || storiesSelected.length === 0) {
      notification.error({ message: "Please select at least of story item!" });
      return;
    }
    const link = `${window.location.host}?stories=${storiesSelected.join(",")}`;
    navigator.clipboard.writeText(link);
    message.info("Copied shared link!");
  };

  const handleGetWorkload = async () => {
    const { subImplIssueType } = form.getFieldsValue();
    const stories = storyForm.getFieldValue("stories") || [];
    if (!Array.isArray(stories) || stories.length === 0) {
      notification.error({ message: "Please select at least a story-item" });
      return;
    }
    if (!subImplIssueType) {
      notification.error({
        message: "Please select issue-type for sub-implement",
      });
      return;
    }
    if (!board || !board.id) {
      notification.error({
        message: "Unexpected error when try to retrieve the boardID",
      });
      return;
    }
    await getWorkloadByStories(
      {
        boardId: board.id,
        subImplIssueType,
        storyIds: stories,
      },
      {
        onLoading: (s) => setStates({ loadingWorkload: s }),
        onFinish: (d) => setStates({ workload: d }),
      }
    );
  };

  useEffect(() => {
    const stories = (router.query.stories as string)?.split(",") || [];
    handleGetTODOStories(undefined, undefined, () => {
      storyForm.setFieldValue("stories", stories);
    });
  }, [board?.id]);

  return (
    <>
      <Form<TFormSearchStory>
        form={form}
        layout="vertical"
        initialValues={{ statusTodo: "To do" }}
        onFinish={handleFormSearchStoriesSubmit}
      >
        <Row className="w-full" gutter={[24, 24]}>
          <Col span={8}>
            <Form.Item
              name="storyIssueType"
              label="Issue type for Story"
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
                disabled={loadingStories}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="statusTodo" label="TODO status">
              <Input placeholder="To do" disabled={loadingStories} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="subImplIssueType"
              label="Issue type for Sub-Impl"
              rules={[
                { required: true, message: "Please select an issue-type" },
              ]}
            >
              <Select
                className="w-full"
                options={issuetypeOptions}
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
                disabled={loadingStories}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="&nbsp;">
              <Button htmlType="submit" disabled={loadingStories}>
                Get stories
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <Form<{ stories: string[] }> form={storyForm}>
        <div className="flex items-center mb-2">
          <Form.Item name="stories" noStyle>
            <Select
              mode="multiple"
              options={storyOptions}
              loading={loadingStories}
              placeholder="Select stories to check workload"
              optionRender={({ value }) => {
                if (!value || !storyDic[value]) return undefined;

                return (
                  <>
                    <span className="text-gray-400">
                      {storyDic[value].key}
                      {" · "}
                    </span>
                    {storyDic[value].fields.summary}
                  </>
                );
              }}
              className="w-[calc(100%-40px)]"
              disabled={loadingStories}
              filterOption={(keyword, option) => {
                if (!option || !option.value) return false;
                const optionItem = storyDic[option.value];
                if (
                  optionItem?.fields.summary
                    .toLowerCase()
                    .includes(keyword.toLowerCase()) ||
                  optionItem?.key.toLowerCase().includes(keyword.toLowerCase())
                )
                  return true;
                return false;
              }}
            />
          </Form.Item>

          <Button
            className="ml-2"
            type="link"
            onClick={() => handleGetStoriesLink()}
            disabled={loadingStories}
          >
            share
          </Button>
        </div>
      </Form>

      <Button
        loading={loadingWorkload}
        disabled={loadingStories || loadingWorkload}
        onClick={() => handleGetWorkload()}
        className="mb-3"
      >
        Get Workload Estimated
      </Button>

      <WorkloadInfo workload={workload} loading={loadingWorkload} />
    </>
  );
};

export default PlanningWorkload;
