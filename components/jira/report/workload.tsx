import { useJira } from "@/context/jira";
import { arrayToDicIfOk } from "@/helper/array-to-dictionary";
import { sortByDate } from "@/helper/sort";
import { sToDHm, transformWorklogSummary } from "@/helper/transform";
import useSelectOptions from "@/hooks/use-select-options";
import useStates from "@/hooks/use-states";
import {
  TSummaryIssueData,
  TSummaryWorklog,
  TSummaryWorklogDataByDate,
} from "@/services/jira/worklog";
import { TSprintJira } from "@/types/jira";
import { TJiraIssueType } from "@/types/jira/issue.type";
import $http from "@/utils/request";
import {
  Button,
  InputNumber,
  Select,
  Table,
  TableProps,
  notification,
} from "antd";
import { useMemo } from "react";

const WorkloadReport = () => {
  const { issuetype, sprint } = useJira();
  const [sprintOptions] = useSelectOptions<TSprintJira>(
    sprint.items,
    "id",
    (s) => (
      <div key={s.id}>
        <span className="text-gray-400">{s.state}</span>
        {" · "}
        {s.name}
      </div>
    )
  );
  const [issueTypeOptions] = useSelectOptions<TJiraIssueType>(
    issuetype.items,
    "id",
    "name"
  );
  const [
    {
      loading,
      worklogData,
      issueData,
      hrsPerDate,
      sprintId,
      issueTypeParent,
      issueTypeImp,
    },
    setSummaryData,
  ] = useStates<{
    issueData: TSummaryIssueData;
    worklogData: TSummaryWorklogDataByDate;
    loading: boolean;
    hrsPerDate: number;
    sprintId: string | number | undefined;
    issueTypeParent: string | undefined;
    issueTypeImp: string | undefined;
  }>({
    issueData: [],
    worklogData: {},
    loading: false,
    hrsPerDate: 6.5,
    sprintId: sprint.selected,
    issueTypeParent: undefined,
    issueTypeImp: undefined,
  });
  // const issueDic = useMemo(() => arrayToDicIfOk(issueData, "key"), [issueData]);
  const { dataSource, columns } = useMemo((): {
    dataSource: any[];
    columns: TableProps<{
      [date: string]: TSummaryWorklog | undefined;
    }>["columns"];
  } => {
    const { account: accountName, summary: summaryWorklogByAccount } =
      transformWorklogSummary(worklogData);

    const dataSourceTransformed = Object.keys(summaryWorklogByAccount).map(
      (accountId) => ({
        accountId,
        name: accountName[accountId],
        ...summaryWorklogByAccount[accountId],
      })
    );

    return {
      dataSource: dataSourceTransformed,
      columns: [
        { title: "Name", dataIndex: "name", key: "name" },
        ...Object.keys(worklogData)
          .sort(sortByDate())
          .map((d) => ({
            title: d,
            dataIndex: d,
            key: d,
            render: (v: TSummaryWorklog) => {
              if (!v) return "--";
              return sToDHm(v.secsSpent, hrsPerDate);
            },
          })),
      ],
    };
  }, [worklogData]);

  const summaryWorkloadData = async () => {
    setSummaryData({ loading: true });
    try {
      if (!(sprintId || sprint.selected) || !issueTypeParent || !issueTypeImp) {
        return;
      }
      const res = await $http.get("/api/workload/summary", {
        params: {
          sprintId: sprintId || sprint.selected,
          parent: issueTypeParent,
          child: issueTypeParent,
        },
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

  return (
    <>
      <div className="mb-5 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-gray-500 font-bold">Sprint</span>
          <Select
            options={sprintOptions}
            value={sprintId}
            showSearch
            filterOption={(keyword, option) => {
              if (!option || !option.value) return false;
              const optionItem = sprint.dic[option.value];
              if (
                optionItem?.name.toLowerCase().includes(keyword.toLowerCase())
              )
                return true;
              return false;
            }}
            onChange={(v) => setSummaryData({ sprintId: v })}
            className="w-56"
            disabled={loading}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 font-bold">Parent</span>
          <Select
            options={issueTypeOptions}
            value={issueTypeParent}
            showSearch
            filterOption={(keyword, option) => {
              if (!option || !option.value) return false;
              const optionItem = issuetype.dic[option.value];
              if (
                optionItem?.name.toLowerCase().includes(keyword.toLowerCase())
              )
                return true;
              return false;
            }}
            onChange={(v) => setSummaryData({ issueTypeParent: v })}
            className="w-32"
            disabled={loading}
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 font-bold">Implement</span>
          <Select
            options={issueTypeOptions}
            value={issueTypeImp}
            onChange={(v) => setSummaryData({ issueTypeImp: v })}
            showSearch
            filterOption={(keyword, option) => {
              if (!option || !option.value) return false;
              const optionItem = issuetype.dic[option.value];
              if (
                optionItem?.name.toLowerCase().includes(keyword.toLowerCase())
              )
                return true;
              return false;
            }}
            className="w-32"
            disabled={loading}
          />
        </div>
        <Button
          onClick={() => summaryWorkloadData()}
          className="mr-5"
          loading={loading}
        >
          Summary
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-bold">Hrs/Date</span>
          <InputNumber
            value={hrsPerDate}
            onChange={(v) => setSummaryData({ hrsPerDate: v || 0 })}
          />
        </div>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
      />
    </>
  );
};

export default WorkloadReport;
