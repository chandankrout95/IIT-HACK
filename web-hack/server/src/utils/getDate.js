export const getCurrentDateTime = () => {
  const now = new Date();

  return {
    iso: now.toISOString(),                 // 2026-02-07T12:30:45.000Z
    date: now.toLocaleDateString("en-IN"),  // 07/02/2026
    time: now.toLocaleTimeString("en-IN"),  // 6:00:45 PM
    timestamp: now.getTime()                // 1707300000000
  };
};
