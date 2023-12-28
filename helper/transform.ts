export const sToDHm = (secs: number) => {
  let secsInput = secs;
  const days = Math.floor(secsInput / (3600 * 6.5));
  secsInput = secsInput % (3600 * 6.5);
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
