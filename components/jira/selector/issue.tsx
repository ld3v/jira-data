import { useJira } from "@/context/jira";
import { Dropdown } from "antd";

const IssueSelector = () => {
  const { issuetype, board, setData } = useJira();

  console.log(board.dic, board.selected);
  return (
    <Dropdown
      menu={{
        items: board.items.map((i) => ({
          label: (
            <>
              <span className="text-gray-400">{i.location.name}</span> -{" "}
              {i.name}
            </>
          ),
          key: i.id,
          onClick: () => setData({ cmd: "board", payload: { selected: i.id } }),
        })),
      }}
    >
      <div className="px-3 py-1 rounded-md bg-white hover:bg-gray-100 border border-gray-100">
        {board.selected ? (
          <b className="text-xs text-gray-400">
            board=&#34;
            <span className="text-gray-600">
              {board.dic[board.selected].location.projectKey}
              <span className="text-gray-400"> · </span>
              {board.dic[board.selected]?.name}
            </span>
            &#34;
          </b>
        ) : (
          "Boards"
        )}
      </div>
    </Dropdown>
  );
};

export default IssueSelector;
