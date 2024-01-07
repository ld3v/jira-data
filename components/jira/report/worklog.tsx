import { useJira } from "@/context/jira";
import { arrayToDicIfOk } from "@/helper/array-to-dictionary";
import { sortByDate } from "@/helper/sort";
import { sToDHm, sToHm, transformWorklogSummary } from "@/helper/transform";
import useSelectOptions from "@/hooks/use-select-options";
import useStates from "@/hooks/use-states";
import { addWorklogByIssueKey } from "@/services/client/worklog";
import {
  TSummaryIssueData,
  TSummaryWorklog,
  TSummaryWorklogDataByDate,
} from "@/services/jira/worklog";
import { TArrayElement } from "@/types";
import { TSprintJira, TWorklog } from "@/types/jira";
import $http from "@/utils/request";
import { PlusCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  InputNumber,
  Modal,
  Popover,
  Progress,
  Select,
  Table,
  TableProps,
  notification,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import WorklogPerSprintChart from "../worklog/summary/sprint.chart";
import { twMerge } from "tailwind-merge";

const WorklogProgress: React.FC<{ spent: number; estimated: number }> = ({
  spent,
  estimated,
}) => {
  const percent =
    spent > estimated
      ? Math.floor(((2 * estimated - spent) / estimated) * 100)
      : Math.floor((spent / estimated) * 100);

  if (spent > estimated) {
    return (
      <Progress percent={100} success={{ percent }} strokeColor="warning" />
    );
  }

  return <Progress percent={percent} strokeColor="green" />;
};

const WorklogByIssueItem: React.FC<{
  issueKey: string;
  issueSummary: string;
  secsSpent: number;
  secsEstimated: number;
  date: string;
  logWorkable?: boolean;
  duedate: string;
}> = ({
  issueKey,
  issueSummary,
  secsSpent,
  secsEstimated,
  date,
  logWorkable,
  duedate,
}) => {
  const { sprint } = useJira();
  const handleAddWorklog = () =>
    addWorklogByIssueKey(
      { key: issueKey, date, secs: secsSpent },
      {
        onFinish: (d: TWorklog) => {
          notification.info({
            message: `Created a new log for issue#${issueKey}!`,
          });
          console.log(d);
        },
      }
    );

  return (
    <div className="px-3 py-2 border border-x-0 border-t-0 border-gray-200 last:border-0">
      <div>
        <a
          href={`/api/go-jira/${issueKey}`}
          target="_blank"
          className="text-gray-400"
        >
          {issueKey} · {issueSummary}
        </a>{" "}
        <PlusCircleOutlined
          className={twMerge(!logWorkable && "hidden")}
          onClick={() =>
            Modal.confirm({
              title: `Add logwork for issue#${issueKey} on ${date}`,
              content: `Do you want to add a log (${sToDHm(
                secsSpent
              )}) for this issue?`,
              onOk: () => handleAddWorklog(),
              okText: "Add",
              okButtonProps: { type: "primary", danger: true },
              cancelText: "Cancel",
            })
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="w-[160px]">
          <WorklogProgress spent={secsSpent} estimated={secsEstimated} />
        </div>
        {duedate}
      </div>
    </div>
  );
};

const WorklogReport: React.FC = () => {
  const { sprint } = useJira();

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
  const [
    { loading, worklogData, issueData, hrsPerDate, sprintId },
    setSummaryData,
  ] = useStates<{
    issueData: TSummaryIssueData;
    worklogData: TSummaryWorklogDataByDate;
    loading: boolean;
    hrsPerDate: number;
    sprintId: string | number | undefined;
  }>({
    issueData: [],
    worklogData: {},
    loading: false,
    hrsPerDate: 6.5,
    sprintId: sprint.selected,
  });
  const issueDic = useMemo(
    () => arrayToDicIfOk<TArrayElement<TSummaryIssueData>>(issueData, "key"),
    [issueData]
  );
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
    console.log(sprint);

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
              return (
                <Popover
                  content={
                    <>
                      {Object.keys(v.details).map((i) => (
                        <WorklogByIssueItem
                          issueKey={i}
                          issueSummary={issueDic[i]?.summary}
                          secsSpent={v.details[i]}
                          secsEstimated={issueDic[i]?.originalEstimateSeconds}
                          duedate={issueDic[i]?.duedate}
                          logWorkable={
                            sprint.dic[sprintId || ""]?.state === "active"
                          }
                          key={i}
                          date={d}
                        />
                      ))}
                    </>
                  }
                >
                  {sToDHm(v.secsSpent, hrsPerDate)}
                </Popover>
              );
            },
          })),
      ],
    };
  }, [worklogData, hrsPerDate]);

  const summaryWorklogData = async () => {
    setSummaryData({ loading: true });
    try {
      if (!sprintId && !sprint.selected) {
        return;
      }
      const res = await $http.get("/api/worklog/mine", {
        params: { sprintId: sprintId || sprint.selected },
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
  }, [sprintId, sprint.selected]);

  return (
    <>
      <span className="text-gray-400">
        This feature is summary worklog for all member in the selected sprint!
      </span>
      <div className="mb-5 flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-gray-500 font-bold">Sprint</span>
          <Select
            options={sprintOptions}
            value={sprintId}
            onChange={(v) => setSummaryData({ sprintId: v })}
            className="w-56"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 font-bold">Hrs/Date</span>
          <InputNumber
            value={hrsPerDate}
            onChange={(v) => setSummaryData({ hrsPerDate: v || 0 })}
          />
        </div>
        <ReloadOutlined onClick={() => summaryWorklogData()} spin={loading} />
      </div>

      <WorklogPerSprintChart data={worklogData} loading={loading} />
      <Table
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        rowKey="accountId"
      />
    </>
  );
};

export default WorklogReport;
