import { useJira } from "@/context/jira";
import useStates from "@/hooks/use-states";
import {
  TSummaryIssueData,
  TSummaryWorklogDataByDate,
} from "@/services/jira/worklog";
import $http from "@/utils/request";
import { Button, Select, notification } from "antd";
import { useEffect } from "react";
import WorklogPerSprintChart from "./sprint.chart";
import useSelectOptions from "@/hooks/use-select-options";

const MyWorklogSummary = () => {
  const { user, sprint, setData, getData } = useJira();
  const [{ loading, ...summaryData }, setSummaryData] = useStates<{
    issueData: TSummaryIssueData;
    worklogData: TSummaryWorklogDataByDate;
    loading: boolean;
  }>({
    issueData: [],
    worklogData: {},
    loading: false,
  });

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
  const summaryWorklogData = async () => {
    setSummaryData({ loading: true });
    try {
      if (!sprint.selected) {
        return;
      }
      const res = await $http.get("/api/worklog/mine", {
        params: { sprintId: sprint.selected },
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

  useEffect(() => {
    summaryWorklogData();
  }, [sprint.selected]);

  if (!user) return null;
  const handleSelectSprint = async (sprintIdSelected: number) => {
    setData({
      cmd: "sprint",
      payload: { selected: sprintIdSelected },
    });
  };

  return (
    <>
      <div className="flex items-center mb-2">
        <Select
          value={sprint.selected}
          options={sprintOptions}
          loading={sprint.loading}
          placeholder="Select a sprint"
          className="w-[calc(100%-40px)]"
          disabled={loading || sprint.loading}
          onChange={handleSelectSprint}
        />

        <Button
          className="ml-2"
          type="link"
          onClick={() => getData({ cmd: "sprint" })}
          disabled={sprint.loading || loading}
        >
          sync
        </Button>
      </div>
      <WorklogPerSprintChart data={summaryData.worklogData} loading={loading} />
    </>
  );
};

export default MyWorklogSummary;
