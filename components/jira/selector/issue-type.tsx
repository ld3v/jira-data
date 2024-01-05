import { useJira } from "@/context/jira";
import { Dropdown } from "antd";

interface IIssueTypeSelector {
  name?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const IssueTypeSelector: React.FC<IIssueTypeSelector> = ({
  name,
  placeholder,
  value,
  onChange,
}) => {
  const internalValue = value || "";
  const { issuetype } = useJira();

  return (
    <Dropdown
      trigger={["click"]}
      menu={{
        items: issuetype.items.map((i) => ({
          label: i.name,
          key: i.id,
          onClick: () => onChange?.(i.id),
        })),
      }}
    >
      <div className="px-3 py-1 rounded-md bg-white hover:bg-gray-100 border border-gray-100 cursor-pointer">
        {internalValue ? (
          <b className="text-xs text-gray-400">
            {name ? `${name}=` : ""}
            &#34;
            <span className="text-gray-600">
              {issuetype.dic[internalValue]?.name}
            </span>
            &#34;
          </b>
        ) : (
          <span className="text-gray-400">{placeholder || "Issue Type"}</span>
        )}
      </div>
    </Dropdown>
  );
};

export default IssueTypeSelector;
