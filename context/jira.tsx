import { JiraAuth, JiraBoards } from "@/components/jira";
import { TJiraBoardsRef } from "@/components/jira/boards.jira";
import {
  arrayToDicIfOk,
  arrayToDictionary,
} from "@/helper/array-to-dictionary";
import useStates from "@/hooks/use-states";
import { TBoardJira, TSprintJira, TUserJira } from "@/types/jira";
import { TJiraIssueType } from "@/types/jira/issue.type";
import $http from "@/utils/request";
import { Skeleton, notification } from "antd";
import Head from "next/head";
import React, { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

export type TJiraData<T = any> = {
  selected?: number;
  items: T[];
  dic: Record<string | number, T>;
  loading: boolean;
};

export type TJiraSetDataPayload =
  | { cmd: "loading"; payload: boolean }
  | { cmd: "user"; payload: TUserJira | null }
  | { cmd: "board"; payload: Partial<TJiraData<TBoardJira>> }
  | { cmd: "sprint"; payload: Partial<TJiraData<TSprintJira>> }
  | { cmd: "issuetype"; payload: Partial<TJiraData<TJiraIssueType>> };
export type TJiraGetDataPayload = { cmd: "board" } | { cmd: "sprint" };

const JiraContext = React.createContext<{
  user: TUserJira | null;
  board: TJiraData<TBoardJira>;
  issuetype: TJiraData<TJiraIssueType>;
  sprint: TJiraData<TSprintJira> & { active?: TSprintJira["id"] };
  setData: (payload: TJiraSetDataPayload) => void;
  getData: (payload: TJiraGetDataPayload) => void;
}>({
  user: null,
  board: {
    loading: true,
    items: [],
    dic: {},
  },
  sprint: {
    loading: true,
    items: [],
    dic: {},
  },
  issuetype: {
    loading: true,
    items: [],
    dic: {},
  },
  setData: () => null,
  getData: () => null,
});

type TJiraProviderProps = {
  children: React.ReactElement[] | React.ReactElement;
  className?: string;
  required?: boolean;
  showUserInfo?: boolean;
  showBoardSelect?: boolean;
};
const JiraProvider: React.FC<TJiraProviderProps> = ({
  children,
  className,
  showUserInfo,
  showBoardSelect,
}) => {
  const boardsRef = useRef<TJiraBoardsRef>();
  const [{ user, loading }, setStates] = useStates<{
    user: TUserJira | null;
    loading: boolean;
  }>({
    user: null,
    loading: true,
  });
  const [boardState, setBoardState] = useStates<TJiraData<TBoardJira>>({
    loading: true,
    items: [],
    dic: {},
  });
  const [sprintState, setSprintState] = useStates<
    TJiraData<TSprintJira> & { active?: TSprintJira["id"] }
  >({
    loading: true,
    items: [],
    dic: {},
  });
  const [issueTypeState, setIssueTypeState] = useStates<
    TJiraData<TJiraIssueType>
  >({
    loading: true,
    items: [],
    dic: {},
  });

  const handleUpdateState = ({ cmd, payload }: TJiraSetDataPayload) => {
    switch (cmd) {
      case "user":
        setStates({ user: payload });
        break;
      case "board":
        const boardDic = arrayToDicIfOk(payload.items, "id");
        setBoardState(
          payload.items !== undefined
            ? {
                ...payload,
                dic: { ...boardState.dic, ...boardDic, ...(payload.dic || {}) },
              }
            : payload
        );
        break;
      case "sprint":
        const sprintDic = arrayToDicIfOk(payload.items, "id");
        setSprintState(
          payload.items !== undefined
            ? {
                ...payload,
                dic: {
                  ...sprintState.dic,
                  ...sprintDic,
                  ...(payload.dic || {}),
                },
              }
            : payload
        );
        break;
      case "issuetype":
        const issueTypeDic = arrayToDicIfOk(payload.items, "id");
        setIssueTypeState(
          payload.items !== undefined
            ? {
                ...payload,
                dic: {
                  ...issueTypeState.dic,
                  ...issueTypeDic,
                  ...(payload.dic || {}),
                },
              }
            : payload
        );
        break;
      case "loading":
        setBoardState({ loading: payload });
        setSprintState({ loading: payload });
        setIssueTypeState({ loading: payload });
        break;
      default:
        console.error("Unknown action to handler state!");
    }
  };

  const handleInit = async () => {
    try {
      setStates({ loading: true });
      const res = await $http.get<{
        user: TUserJira | null;
        board: TBoardJira | null;
        boards: TBoardJira[];
        sprints: TSprintJira[];
        issuetype: TJiraIssueType[];
      }>("/api/init");

      // setStates(res.data);
      handleUpdateState({ cmd: "user", payload: res.data.user });
      handleUpdateState({
        cmd: "board",
        payload: {
          selected: res.data.board?.id,
          items: res.data.boards ? res.data.boards : [],
        },
      });
      handleUpdateState({
        cmd: "sprint",
        payload: {
          items: res.data.sprints || [],
        },
      });
      handleUpdateState({
        cmd: "issuetype",
        payload: { items: res.data.issuetype || [] },
      });
    } catch (err: any) {
      notification.error({
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setStates({ loading: false });
      handleUpdateState({ cmd: "loading", payload: false });
    }
  };

  useEffect(() => {
    handleInit();
  }, []);

  const handleGetData = ({ cmd }: TJiraGetDataPayload) => {
    if (!boardsRef.current) return;
    switch (cmd) {
      case "board":
        boardsRef.current.fetchBoards();
        break;
      case "sprint":
        boardsRef.current.fetchSprints();
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    boardsRef.current?.resetBoards();
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Jira Integrate · nqhuy</title>
        </Head>
        <div className="w-[calc(100%-20px)] max-w-[1280px] m-auto p-5">
          <Skeleton active />
        </div>
      </>
    );
  }

  return (
    <div className={twMerge("flex flex-col gap-5", className)}>
      <JiraContext.Provider
        value={{
          user,
          board: boardState,
          issuetype: issueTypeState,
          sprint: sprintState,
          setData: handleUpdateState,
          getData: handleGetData,
        }}
      >
        <JiraAuth
          showUserInfo={showUserInfo}
          onResetUser={handleReset}
          onGotUser={() => handleInit()}
        />
        <JiraBoards
          ref={(r) => (boardsRef.current = r || undefined)}
          show={showBoardSelect}
        />
        {children}
      </JiraContext.Provider>
    </div>
  );
};

export default JiraProvider;
export const withJira =
  (props: Omit<TJiraProviderProps, "children"> = {}) =>
  (WrappedComponent: React.FC) => {
    return class WithHover extends React.Component {
      render() {
        return (
          <JiraProvider {...props}>
            <WrappedComponent />
          </JiraProvider>
        );
      }
    };
  };
export const useJira = () => React.useContext(JiraContext);
