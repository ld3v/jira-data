import IssueSelector from "@/components/jira/selector/issue";
import UserAvatar from "@/components/jira/user";
import { useJira, withJira } from "@/context/jira";
import { message } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";

const PlanningPage = () => {
  const { user } = useJira();

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

export default withJira({
  className: "w-[calc(100%-20px)] max-w-[1280px] m-auto py-5",
  showUserInfo: false,
  showBoardSelect: false,
  required: true,
})(PlanningPage);
