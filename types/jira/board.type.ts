export type TBoardJira = {
  id: number;
  self: string;
  name: string;
  type: 'kanban' | 'scrum';
  location: {
    projectId: number;
    displayName: string;
    projectName: string;
    projectKey: string;
    projectTypeKey: string;
    avatarURI: string;
    name: string;
  };
};
