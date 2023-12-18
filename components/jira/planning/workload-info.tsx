import { sToHm } from "@/helper/transform";
import {
  TAuthorJira,
  TWorkloadByAssignee,
  TWorkloadSummary,
} from "@/types/jira";
import { Popover, Table } from "antd";
import { useMemo } from "react";

interface IWorkloadInfo {
  workload: TWorkloadSummary | null;
  loading?: boolean;
}

const WorkloadInfo: React.FC<IWorkloadInfo> = ({ workload, loading }) => {
  const workloadByAssignee = useMemo(
    () => internalTransformWorkloadDataToAssigner(workload?.subImplAssigned),
    [workload?.subImplAssigned]
  );

  if (!workload) return null;

  return (
    <div className="flex">
      <div className="w-80">
        <Table<TWorkloadByAssignee>
          loading={loading}
          columns={[
            {
              title: "Assigner",
              dataIndex: "displayName",
              width: 4 * 45,
            },
            {
              title: "Total",
              dataIndex: "workload",
              width: 4 * 35,
              render: (s, { tickets }) => {
                if (s === 0) return <span className="text-gray-400">--</span>;
                const ticketHandles = tickets.map((t) => (
                  <div key={t.key}>
                    <span className="font-bold">{t.key}</span> (
                    {t.timetracking?.originalEstimate || "--"})
                  </div>
                ));
                return (
                  <Popover
                    content={
                      <div className="flex gap-2 flex-wrap max-w-[280px]">
                        {ticketHandles}
                      </div>
                    }
                  >
                    <span className="font-bold italic">{sToHm(s)}</span>
                  </Popover>
                );
              },
            },
          ]}
          tableLayout="fixed"
          dataSource={workloadByAssignee}
          pagination={false}
        />
      </div>
    </div>
  );
};

const internalTransformWorkloadDataToAssigner = (
  subImplAssigned?: TWorkloadSummary["subImplAssigned"]
): TWorkloadByAssignee[] => {
  if (!subImplAssigned) return [];
  const subImplAssignedByMember: Record<
    TAuthorJira["accountId"],
    TWorkloadByAssignee
  > = Object.keys(subImplAssigned).reduce(
    (pre: Record<TAuthorJira["accountId"], TWorkloadByAssignee>, current) => {
      const {
        key,
        fields: { assignee, timetracking, summary },
      } = subImplAssigned[current];
      if (!pre[assignee.accountId]) {
        pre[assignee.accountId] = {
          accountId: assignee.accountId,
          displayName: assignee.displayName,
          workload: 0,
          tickets: [],
        };
      }

      // Summary workload by assignee
      pre[assignee.accountId].workload +=
        timetracking?.originalEstimateSeconds || 0;
      pre[assignee.accountId].tickets.push({
        key,
        timetracking,
      });

      return pre;
    },
    {}
  );

  return Object.values(subImplAssignedByMember);
};

export default WorkloadInfo;
