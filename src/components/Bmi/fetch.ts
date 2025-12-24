export async function getOverviewData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    users: {
      value: 3456,
      growthRate: -0.95,
    },
  };
}