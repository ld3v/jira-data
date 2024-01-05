import { useJira } from "@/context/jira";
import $http from "@/utils/request";
import { Avatar, Dropdown, message } from "antd";

const UserAvatar = () => {
  const { user } = useJira();
  const handleReset = async () => {
    await $http.post("/api/reset");
    message.info("Reload this page after 5s");
    setTimeout(() => location.reload(), 5000);
  };

  return (
    <Dropdown
      menu={{
        items: [
          {
            label: "Logout",
            onClick: () => handleReset(),
            danger: true,
            className: "w-[100px]",
            key: "logout",
          },
        ],
      }}
      placement="bottomRight"
    >
      <div className="w-[38px] h-[38px] p-0.5 border border-gray-300  rounded-full">
        <Avatar src={user?.avatarUrls["48x48"]} shape="circle" />
      </div>
    </Dropdown>
  );
};

export default UserAvatar;
