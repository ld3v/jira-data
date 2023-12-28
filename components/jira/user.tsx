import { useJira } from "@/context/jira";
import { Avatar, Dropdown } from "antd";

const UserAvatar = () => {
  const { user } = useJira();

  return (
    <Dropdown trigger={["click"]} menu={{ items: [] }} placement="bottomRight">
      <div className="w-[38px] h-[38px] p-0.5 border border-gray-300  rounded-full">
        <Avatar src={user?.avatarUrls["48x48"]} shape="circle" />
      </div>
    </Dropdown>
  );
};

export default UserAvatar;
