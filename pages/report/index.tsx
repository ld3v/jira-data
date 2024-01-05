import Footer from "@/components/footer";
import WorkloadReport from "@/components/jira/report/workload";
import WorklogReport from "@/components/jira/report/worklog";
import IssueSelector from "@/components/jira/selector/issue";
import UserAvatar from "@/components/jira/user";
import { useJira, withJira } from "@/context/jira";
import { Collapse } from "antd";
import Head from "next/head";

const ReportPageHeader = () => {
  const { user } = useJira();

  if (!user) return null;

  return (
    <div className="w-full rounded-md border border-gray-100 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <IssueSelector />
        </div>
        <UserAvatar />
      </div>
    </div>
  );
};

const ReportPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Jira</title>
      </Head>
      <ReportPageHeader />

      <Collapse
        items={[
          {
            label: "Summary Worklog",
            children: <WorklogReport />,
          },
          {
            label: "Summary Workload",
            children: <WorkloadReport />,
          },
        ]}
      />
      <Footer />
    </>
  );
};

export default withJira({
  className: "w-[calc(100%-20px)] max-w-[1280px] m-auto py-5",
  showUserInfo: false,
  showBoardSelect: false,
  required: true,
})(ReportPage);
