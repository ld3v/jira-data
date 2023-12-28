import PlanningWorkload from "@/components/jira/planning/summary";
import AddLogwork from "@/components/jira/worklog/add";
import MyWorklogSummary from "@/components/jira/worklog/summary";
import JiraProvider from "@/context/jira";
import { Collapse } from "antd";
import Head from "next/head";
import TaskPriority from "@/components/jira/planning/task-priority";

export default function Home() {
  return (
    <>
      <Head>
        <title>Jira Integrate · nqhuy</title>
      </Head>
      <div className="w-[calc(100%-20px)] max-w-[1280px] m-auto p-5">
        <JiraProvider required>
          {/* Data calculated */}
          <Collapse
            items={[
              {
                key: "planning-workload-by-stories",
                label: "Summary Workload by Story (PBI)",
                children: <PlanningWorkload />,
              },
              {
                key: "summary-worklog-by-sprint",
                label: "Summary Worklog By Sprint",
                children: <MyWorklogSummary />,
              },
              {
                key: "task-priority-by-sprint",
                label: "Task Priority By Sprint",
                children: <TaskPriority />,
              },
              {
                key: "add-worklog-in-active-sprint",
                label: "Log your working-time",
                children: <AddLogwork />,
              },
            ]}
          />
        </JiraProvider>
        <div className="py-5 text-center text-sm text-gray-400">
          Implement somethings? Create a new pull-request{" "}
          <a
            className="text-gray-600 underline"
            href="https://github.com/ld3v/jira-integrate"
            target="_blank"
          >
            here
          </a>
          {" · "}
          Developed by{" "}
          <a
            href="https://nqhuy.dev"
            target="_blank"
            className="text-gray-600 underline"
          >
            nqhuy.dev
          </a>
        </div>
      </div>
    </>
  );
}
