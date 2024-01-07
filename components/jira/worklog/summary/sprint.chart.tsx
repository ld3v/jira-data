"use client";
import { COLORS } from "@/helper/constant";
import { sortByDate } from "@/helper/sort";
import { sToHm } from "@/helper/transform";
import useStates from "@/hooks/use-states";
import {
  TSummaryWorklog,
  TSummaryWorklogDataByDate,
} from "@/services/jira/worklog";
import { Select, Spin } from "antd";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TTimeSpentByPerson = { [user: string]: number };

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
    const chart = dates
      .filter((d) => (selectedDate ? d === selectedDate : true))
      .map((date) => {
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
  }, [data, selectedDate]);

  return (
    <Spin spinning={loading}>
      <div className="w-full h-full border border-dashed border-gray-400 rounded-md p-2">
        <div className="relative w-full h-[480px]">
          <ResponsiveContainer width="100%" height={480}>
            <AreaChart data={dataRendered.chart}>
              <defs>
                {Object.keys(dataRendered.members)
                  .filter((m) => (selectedMember ? m === selectedMember : m))
                  .map((mem, memI) => (
                    <linearGradient
                      id={`color_${memI}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                      key={`def_${mem}`}
                    >
                      <stop
                        offset="5%"
                        stopColor={COLORS[memI]}
                        stopOpacity={0.1}
                      />
                      <stop
                        offset="95%"
                        stopColor={COLORS[memI]}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  ))}
              </defs>
              <CartesianGrid stroke="#eee" strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={sToHm} />
              <Tooltip formatter={sToHm} />
              <Legend />
              {Object.keys(dataRendered.members)
                .filter((m) => (selectedMember ? m === selectedMember : m))
                .map((mem, memI) => (
                  // <Line
                  //   type="monotone"
                  //   dataKey={dataRendered.members[mem].name}
                  //   stroke={COLORS[memI]}
                  //   key={mem}
                  // />
                  <Area
                    type="monotone"
                    dataKey={dataRendered.members[mem].name}
                    stroke={COLORS[memI]}
                    fillOpacity={1}
                    fill={`url(#color_${memI})`}
                    key={mem}
                  />
                ))}
            </AreaChart>
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
