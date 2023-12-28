import { useJira } from "@/context/jira";
import useSelectOptions from "@/hooks/use-select-options";
import useStates from "@/hooks/use-states";
import { TJiraIssue } from "@/types/jira/issue.type";
import { Form, Input, Select, Space } from "antd";
import { useEffect, useMemo } from "react";

const AddLogwork = () => {
  const { sprint, issuetype } = useJira();
  const activeSprint = useMemo(
    () => sprint.items.find((s) => s.state === "active"),
    [sprint.items]
  );
  const [{ loadingIssues, issues }, setStates] = useStates<{
    loadingIssues: boolean;
    issues: TJiraIssue[];
  }>({ loadingIssues: false, issues: [] });
  const [issueOpts] = useSelectOptions(
    issues,
    "id",
    ({ fields }) => fields.summary
  );
  const [issueTypeOpts] = useSelectOptions(issuetype.items, "id", "name");

  const handleGetSubImplBySprint = async () => {};

  useEffect(() => {
    handleGetSubImplBySprint();
  }, [activeSprint?.id]);

  if (!activeSprint) {
    return (
      <div className="py-5 text-center text-gray-400">
        No active sprint found!
      </div>
    );
  }

  const handleSelectIssueType = async () => {
    
  }

  return (
    <>
      <Form>
        <Space.Compact className="w-full">
          <Form.Item name="issueType" noStyle>
            <Select
              options={issueTypeOpts}
              className="w-36"
              loading={issuetype.loading}
              onChange={handleSelectIssueType}
            />
          </Form.Item>
          <Form.Item name="issues" noStyle>
            <Select
              options={issueOpts}
              loading={loadingIssues}
              className="w-[calc(100%-144px)]"
            />
          </Form.Item>
        </Space.Compact>
      </Form>
    </>
  );
};

export default AddLogwork;
