export type TSprintJira = {
  id: number;
  self: string;
  state: "closed" | "active" | "future";
  name: string;
  startDate: string;
  endDate: string;
  completeDate: string;
  originBoardId: number;
  goal: string;
};
