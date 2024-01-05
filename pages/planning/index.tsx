import IssueSelector from "@/components/jira/selector/issue";
import IssueTypeSelector from "@/components/jira/selector/issue-type";
import UserAvatar from "@/components/jira/user";
import { useJira, withJira } from "@/context/jira";
import useStates from "@/hooks/use-states";

const PlanningPage = () => {
  const {
    user,
    board: { selected: boardSelected },
  } = useJira();
  const [{ parent, child }, setStates] = useStates<{
    parent?: string;
    child?: string;
  }>({});

  return (
    <div className="w-full rounded-md border border-gray-100 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <IssueSelector />
          {boardSelected ? (
            <>
              {" / "}
              <IssueTypeSelector
                placeholder="Parent"
                value={parent}
                onChange={(v) => setStates({ parent: v })}
              />
            </>
          ) : null}
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
