import { useJiraUser } from "@/context/jira";
import useStates from "@/hooks/use-states";
import {
  TSummaryIssueData,
  TSummaryWorklogDataByDate,
} from "@/services/jira/worklog";
import $http from "@/utils/request";
import { Button, Select, notification } from "antd";
import { useEffect, useMemo } from "react";
import WorklogPerSprintChart from "./sprint.chart";
import { TSprintJira } from "@/types/jira";

const MyWorklogSummary = () => {
  const { user, currentSprint, board, setData } = useJiraUser();
  const [{ loading, loadingSprint, sprints, ...summaryData }, setSummaryData] =
    useStates<{
      issueData: TSummaryIssueData;
      worklogData: TSummaryWorklogDataByDate;
      sprints: TSprintJira[];
      loading: boolean;
      loadingSprint: boolean;
    }>({
      issueData: [],
      worklogData: {},
      sprints: [],
      loading: false,
      loadingSprint: false,
    });

  const sprintOptions = useMemo(
    () =>
      sprints.map((s) => ({
        value: s.id,
        label: (
          <span>
            <span className="text-gray-400">{s.name}</span>
            {" · "}
            {s.state}
          </span>
        ),
      })),
    [sprints]
  );
  const summaryWorklogData = async () => {
    setSummaryData({ loading: true });
    try {
      if (!currentSprint || !currentSprint.id) {
        return;
      }
      const res = await $http.get("/api/worklog/mine", {
        params: { sprintId: currentSprint.id },
      });
      setSummaryData(res.data);
    } catch (err: any) {
      notification.error({
        message:
          err.message || "Unexpected error happens when calculate worklog data",
      });
    } finally {
      setSummaryData({ loading: false });
    }
  };
  const getSprintsByBoardId = async () => {
    if (!board || !board.id) {
      return;
    }
    setSummaryData({ loadingSprint: true });
    try {
      const res = await $http.get("/api/sprint", {
        params: { boardId: board.id },
      });
      setSummaryData({ sprints: res.data.values });
    } catch (err: any) {
      notification.error({ message: err.message });
    } finally {
      setSummaryData({ loadingSprint: false });
    }
  };

  useEffect(() => {
    getSprintsByBoardId();
  }, [board?.id]);
  useEffect(() => {
    summaryWorklogData();
  }, [currentSprint && currentSprint.id]);

  if (!user) return null;
  const handleSelectSprint = async (sprintIdSelected: number) => {
    setData({
      currentSprint: sprints.find((s) => s.id === sprintIdSelected),
    });
  };

  return (
    <>
      <div className="flex items-center mb-2">
        <Select
          defaultValue={currentSprint?.id}
          options={sprintOptions}
          loading={loadingSprint}
          placeholder="Select a sprint"
          className="w-[calc(100%-40px)]"
          disabled={loading || loadingSprint}
          onChange={handleSelectSprint}
        />

        <Button
          className="ml-2"
          type="link"
          onClick={() => getSprintsByBoardId()}
          disabled={loadingSprint || loading}
        >
          sync
        </Button>
      </div>
      <WorklogPerSprintChart data={summaryData.worklogData} loading={loading} />
    </>
  );
};

export default MyWorklogSummary;
