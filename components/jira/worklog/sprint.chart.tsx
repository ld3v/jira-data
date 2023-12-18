"use client";
import { COLORS } from "@/helper/constant";
import { sortByDate } from "@/helper/sort";
import useStates from "@/hooks/use-states";
import {
  TSummaryWorklog,
  TSummaryWorklogDataByDate,
} from "@/services/jira/worklog";
import { Select, Spin } from "antd";
import dayjs from "dayjs";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TTimeSpentByPerson = { [user: string]: number };

const formaSToHm = (secs: number) => {
  const hrs = Math.floor(secs / 3600);
  const mins = Math.floor((secs % 3600) / 60);
  return [hrs ? `${hrs}h` : undefined, mins ? `${mins}m` : undefined]
    .filter((i) => i)
    .join(" ");
};

const WorklogPerSprintChart: React.FC<{
  data: TSummaryWorklogDataByDate;
  loading?: boolean;
}> = ({ data, loading }) => {
  const [{ selectedDate, selectedMember }, setStates] = useStates<{
    selectedDate?: string;
    selectedMember?: string;
  }>({});
  const dataRendered = useMemo(() => {
    const members: { [accountId: string]: TSummaryWorklog } = {};
    const dates = Object.keys(data).sort(sortByDate());
    const chart = dates.map((date) => {
      const timeSpentByMembers: TTimeSpentByPerson = Object.keys(
        data[date]
      ).reduce((p: TTimeSpentByPerson, c) => {
        const user = data[date][c];
        if (!user) return p;

        members[user.accountId] = user;

        p[user.name] = user.secsSpent;
        return p;
      }, {});
      return {
        date,
        ...timeSpentByMembers,
      };
    });

    return {
      members,
      chart,
      dates,
    };
  }, [data]);

  return (
    <Spin spinning={loading}>
      <div className="w-full h-full border border-dashed border-gray-400 rounded-md p-2">
        <div className="relative w-full h-[480px]">
          <ResponsiveContainer width="100%" height={480}>
            <BarChart data={dataRendered.chart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={formaSToHm} />
              <Tooltip formatter={formaSToHm} />
              <Legend />
              {Object.keys(dataRendered.members)
                .filter((m) => (selectedMember ? m === selectedMember : m))
                .map((mem, memI) => (
                  <Bar
                    dataKey={dataRendered.members[mem].name}
                    fill={COLORS[memI]}
                    key={mem}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="flex items-center gap-5 mt-3">
        <span className="font-bold after:content-[':']">Filter by</span>
        <Select
          className="w-32"
          placeholder="Date"
          options={dataRendered.dates.map((d) => ({ value: d, label: d }))}
          value={selectedDate}
          onChange={(v) => setStates({ selectedDate: v })}
          allowClear
          disabled
        />
        <Select
          className="w-48"
          placeholder="Member"
          options={Object.keys(dataRendered.members).map((a) => ({
            value: a,
            label: dataRendered.members[a].name,
          }))}
          value={selectedMember}
          onChange={(v) => setStates({ selectedMember: v })}
          allowClear
        />
      </div>
    </Spin>
  );
};

export default WorklogPerSprintChart;
