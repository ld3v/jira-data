export type TUserJira = {
  self: string;
  key: string;
  accountId: string;
  accountType: string; // "atlassian";
  name: string;
  emailAddress: string;
  avatarUrls: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
  displayName: string;
  active: true;
  timeZone: string;
  groups: {
    size: number;
    items: any[];
  };
  applicationRoles: {
    size: number;
    items: any[];
  };
};

export type TAuthorJira = {
  self: string;
  accountId: string;
  displayName: string;
  active: boolean;
};
