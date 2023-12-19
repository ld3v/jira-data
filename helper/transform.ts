export const sToHm = (secs: number) => {
  let secsInput = secs;
  const days = Math.floor(secsInput / (3600 * 8));
  secsInput = secsInput % (3600 * 8);
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
