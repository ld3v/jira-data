import { useJira } from "@/context/jira";
import useSelectOptions from "@/hooks/use-select-options";
import useStates from "@/hooks/use-states";
import { getIssueByBoardAndIssueType } from "@/services/client/issue";
import { getWorkloadByStories } from "@/services/client/workload";
import { TWorkloadSummary } from "@/types/jira";
import { TJiraIssue, TJiraIssueType } from "@/types/jira/issue.type";
import {
  Button,
  Col,
  Form,
  FormProps,
  Row,
  Select,
  SelectProps,
  message,
  notification,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef } from "react";
import WorkloadInfo from "./workload-info";
import dayjs from "dayjs";

type TFormSearchStory = {
  storyIssueType: string | number;
  subImplIssueType: string | number;
  statuses: string[];
};

const PlanningWorkload = () => {
  const router = useRouter();
  const [form] = Form.useForm<TFormSearchStory>();
  const [storyForm] = Form.useForm<{ stories: string[] }>();
  const { board, issuetype } = useJira();
  const [issuetypeOptions, issuetypeDic] = useSelectOptions<TJiraIssueType>(
    issuetype.items,
    "id",
    "name",
    (a, b) => b.hierarchyLevel - a.hierarchyLevel
  );
  const [
    {
      loadingStories,
      loadingWorkload,
      stories,
      workload,
      parentIssueTypeId,
      syncWorkloadTimerValue,
      lastSyncedPlanningWorkloadAt,
    },
    setStates,
  ] = useStates<{
    loadingStories: boolean;
    loadingWorkload: boolean;
    stories: TJiraIssue[];
    workload: TWorkloadSummary | null;
    syncWorkloadTimerValue: number;
    lastSyncedPlanningWorkloadAt: Date | null;
    parentIssueTypeId?: string;
  }>({
    loadingStories: false,
    loadingWorkload: false,
    syncWorkloadTimerValue: 0,
    lastSyncedPlanningWorkloadAt: null,
    stories: [],
    workload: null,
  });
  const beforeTimerSyncWorkload = useRef<number>(0);
  const parentChildIssueTypeOptions = useMemo(
    () =>
      issuetypeOptions.map(({ value, label, disabled }) =>
        parentIssueTypeId &&
        value &&
        issuetypeDic[parentIssueTypeId].hierarchyLevel <=
          issuetypeDic[value].hierarchyLevel
          ? { value, label, disabled: true }
          : { value, label, disabled }
      ),
    [parentIssueTypeId]
  );

  const [storyOptions, storyDic] = useSelectOptions(stories, "id", "key");

  const handleGetTODOStories = (
    storyIssueType: TFormSearchStory["storyIssueType"] = "Story",
    statuses?: TFormSearchStory["statuses"],
    callback?: () => void
  ) =>
    board && board.selected
      ? getIssueByBoardAndIssueType(
          {
            boardId: board.selected,
            issueType: storyIssueType,
            statuses,
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
    async ({ storyIssueType, statuses }) => {
      // Reset query params & stories item
      storyForm.resetFields();
      window.history.replaceState(null, "", router.pathname);
      await handleGetTODOStories(storyIssueType, statuses);
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

  const handleGetWorkload = async (cb?: () => void) => {
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
    if (!board || !board.selected) {
      notification.error({
        message: "Unexpected error when try to retrieve the boardID",
      });
      return;
    }
    await getWorkloadByStories(
      {
        boardId: board.selected,
        subImplIssueType,
        storyIds: stories,
      },
      {
        onLoading: (s) => setStates({ loadingWorkload: s }),
        onFinish: (d) => {
          setStates({ workload: d });
          cb?.();
        },
      }
    );
  };

  useEffect(() => {
    const stories = (router.query.stories as string)?.split(",") || [];
    handleGetTODOStories(undefined, undefined, () => {
      storyForm.setFieldValue("stories", stories);
    });
  }, [board.selected]);

  useEffect(() => {
    if (
      beforeTimerSyncWorkload.current === syncWorkloadTimerValue ||
      syncWorkloadTimerValue === 0
    )
      return;
    beforeTimerSyncWorkload.current = syncWorkloadTimerValue;
    let timer = setInterval(
      () =>
        handleGetWorkload(() =>
          setStates({ lastSyncedPlanningWorkloadAt: new Date() })
        ),
      syncWorkloadTimerValue * 1000
    );

    if (beforeTimerSyncWorkload.current !== syncWorkloadTimerValue)
      clearInterval(timer);
    return () => {
      clearInterval(timer);
    };
  }, [syncWorkloadTimerValue]);

  const handleParentIssueTypeChanged: SelectProps["onChange"] = (value) => {
    setStates({ parentIssueTypeId: value });
    const childIssueType = form.getFieldValue("subImplIssueType");
    if (!childIssueType) return;
    if (
      issuetypeDic[childIssueType].hierarchyLevel >=
      issuetypeDic[value].hierarchyLevel
    ) {
      form.setFieldValue("subImplIssueType", undefined);
    }
  };
  const handleParentChildIssueTypeChanged: SelectProps["onChange"] = (
    value
  ) => {
    const parentIssueType = form.getFieldValue("storyIssueType");
    if (!value) setStates({ syncWorkloadTimerValue: 0 });
    if (!parentIssueType) return;
    if (
      issuetypeDic[parentIssueType].hierarchyLevel <
      issuetypeDic[value].hierarchyLevel
    ) {
      form.setFieldValue("storyIssueType", undefined);
    }
  };

  return (
    <>
      <Form<TFormSearchStory>
        form={form}
        layout="vertical"
        initialValues={{ statuses: ["To do"] }}
        onFinish={handleFormSearchStoriesSubmit}
      >
        <Row className="w-full" gutter={[24, 24]}>
          <Col span={6}>
            <Form.Item
              name="storyIssueType"
              label="Parent"
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
                onChange={handleParentIssueTypeChanged}
                disabled={loadingStories}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="subImplIssueType"
              label="Parent's child"
              rules={[
                { required: true, message: "Please select an issue-type" },
              ]}
            >
              <Select
                className="w-full"
                options={parentChildIssueTypeOptions}
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
                onChange={handleParentChildIssueTypeChanged}
                disabled={loadingStories}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="statuses" label="Parent's status">
              <Select mode="tags" loading={loadingStories} />
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
              placeholder="Parent's items"
              optionRender={({ value }) => {
                if (!value || !storyDic[value]) return undefined;

                return (
                  <>
                    <span className="text-gray-400">
                      <span
                        className={
                          storyDic[value].fields.status.name.toLowerCase() ===
                          "done"
                            ? "line-through"
                            : ""
                        }
                      >
                        {storyDic[value].key}
                      </span>
                      {" · "}
                      {storyDic[value].fields.status.name}
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
              onChange={(v) => {
                if (!Array.isArray(v) || v.length === 0)
                  setStates({ syncWorkloadTimerValue: 0 });
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

      <div className="flex justify-between items-center">
        <Button
          loading={loadingWorkload}
          disabled={loadingStories || loadingWorkload}
          onClick={() => handleGetWorkload()}
          className="mb-3"
        >
          Get Workload Estimated
        </Button>
        <div className="flex items-center gap-5">
          {lastSyncedPlanningWorkloadAt && (
            <span className="text-sm text-gray-400">
              Last sync at{" "}
              <span className="text-gray-600">
                {dayjs(lastSyncedPlanningWorkloadAt).format(
                  "DD/MM/YYYY HH:mm:ss"
                )}
              </span>
            </span>
          )}
          <Select
            value={syncWorkloadTimerValue}
            className="w-[150px]"
            options={[
              { value: 0, label: "sync manually" },
              { value: 15, label: "each 15 seconds" },
              { value: 30, label: "each 30 seconds" },
              { value: 60, label: "each 1 minute" },
              { value: 900, label: "each 15 minutes" },
              { value: 1800, label: "each 30 minutes" },
            ]}
            onChange={(v) => {
              const storySelected = storyForm.getFieldValue("stories");
              const parentChild = form.getFieldValue("subImplIssueType");
              if (
                v &&
                (!Array.isArray(storySelected) ||
                  storySelected.length === 0 ||
                  !parentChild)
              ) {
                notification.error({
                  message: "Please select at least one Parent item!",
                });
                return;
              }
              setStates({ syncWorkloadTimerValue: v });
            }}
          />
        </div>
      </div>

      <WorkloadInfo workload={workload} loading={loadingWorkload} />
    </>
  );
};

export default PlanningWorkload;
