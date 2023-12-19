import { JiraAuth, JiraBoards } from "@/components/jira";
import { TJiraBoardsRef } from "@/components/jira/boards.jira";
import PlanningWorkload from "@/components/jira/planning/workload-summary";
import MyWorklogSummary from "@/components/jira/worklog/summary";
import JiraProvider, { TJiraProviderState } from "@/context/jira";
import useStates from "@/hooks/use-states";
import $http from "@/utils/request";
import { Collapse, Skeleton, notification } from "antd";
import { useEffect, useRef } from "react";

export default function Home() {
  const boardsRef = useRef<TJiraBoardsRef>();
  const [{ user, board, issuetype, currentSprint, loading }, setData] =
    useStates<TJiraProviderState>({
      user: null,
      board: null,
      issuetype: [],
      currentSprint: null,
      loading: true,
    });

  const handleReset = () => {
    boardsRef.current?.resetBoards();
  };

  const handleInit = async () => {
    try {
      setData({ loading: true });
      const res = await $http.get("/api/init");

      setData(res.data);
    } catch (err: any) {
      notification.error({
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setData({ loading: false });
    }
  };

  useEffect(() => {
    handleInit();
  }, []);

  if (loading) {
    return (
      <div className="w-[calc(100%-20px)] max-w-[960px] m-auto p-5">
        <Skeleton active />
      </div>
    );
  }

  return (
    <div className="w-[calc(100%-20px)] max-w-[960px] m-auto p-5">
      <JiraProvider
        user={user}
        board={board}
        issuetype={issuetype}
        currentSprint={currentSprint}
        setData={setData}
        required
      >
        <JiraAuth onResetUser={handleReset} className="mb-5" />
        <JiraBoards
          ref={(r) => (boardsRef.current = r || undefined)}
          className="mb-5"
        />
        {/* Data calculated */}
        <Collapse
          items={[
            {
              key: "summary-worklog-by-sprint",
              label: "Summary Worklog By Sprint",
              children: <MyWorklogSummary />,
            },
            {
              key: "planning-workload-by-stories",
              label: "Planning Workload by TODO stories",
              children: <PlanningWorkload />,
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
  );
}
