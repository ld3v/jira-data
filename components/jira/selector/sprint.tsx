import { useJira } from "@/context/jira";
import { Dropdown } from "antd";
import { twMerge } from "tailwind-merge";

const SprintSelector = () => {
  const { board, sprint, setData } = useJira();
  return (
    <Dropdown
      disabled={!board.selected}
      trigger={["click"]}
      menu={{
        items: sprint.items.map((i) => ({
          label: (
            <>
              <span className="text-gray-400">{i.state}</span>
              {" · "}
              {i.name}
            </>
          ),
          key: i.id,
          onClick: () =>
            setData({ cmd: "sprint", payload: { selected: i.id } }),
        })),
      }}
    >
      <div
        className={twMerge(
          "px-3 py-1 rounded-md bg-white border border-gray-100",
          !board.selected
            ? "cursor-not-allowed"
            : "hover:bg-gray-100 cursor-pointer"
        )}
      >
        {sprint.selected ? (
          <b className="text-xs text-gray-400">
            sprint=&#34;
            <span className="text-gray-600">
              {sprint.dic[sprint.selected]?.name}
            </span>
            &#34;
          </b>
        ) : (
          "Sprint"
        )}
      </div>
    </Dropdown>
  );
};

export default SprintSelector;
