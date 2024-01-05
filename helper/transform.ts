import {
  TSummaryWorklogDataByAccount,
  TSummaryWorklogDataByDate,
} from "@/services/jira/worklog";

export const sToDHm = (secs: number, hrsPerDate = 6.5) => {
  let secsInput = secs;
  const days = Math.floor(secsInput / (3600 * hrsPerDate));
  secsInput = secsInput % (3600 * hrsPerDate);
  const hours = Math.floor(secsInput / 3600);
  secsInput = secsInput % 3600;
  const minutes = Math.floor(secsInput / 60);

  return [
    days ? `${days}d` : undefined,
    hours ? `${hours}h` : hours,
    minutes ? `${minutes}m` : minutes,
  ]
    .filter((t) => t)
    .join(" ");
};
export const sToHm = (secs: number) => {
  let secsInput = secs;
  const hours = Math.floor(secsInput / 3600);
  secsInput = secsInput % 3600;
  const minutes = Math.floor(secsInput / 60);

  return [hours ? `${hours}h` : hours, minutes ? `${minutes}m` : minutes]
    .filter((t) => t)
    .join(" ");
};

export const transformWorklogSummary = (summary: TSummaryWorklogDataByDate) => {
  const newObj: TSummaryWorklogDataByAccount = {};
  const accountDic: Record<string, string | undefined> = {};

  Object.keys(summary).forEach((date) => {
    const worklogByPerByDate = summary[date];

    Object.keys(worklogByPerByDate).forEach((personId) => {
      if (!newObj[personId]) {
        newObj[personId] = {};
      }

      if (!newObj[personId][date]) {
        accountDic[personId] = summary[date][personId]?.name;
        newObj[personId][date] = summary[date][personId];
      }
    });
  });

  return {
    summary: newObj,
    account: accountDic,
  };
};
