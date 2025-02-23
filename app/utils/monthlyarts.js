export async function fetchMonthlyArts() {
  const res = await fetch("/api/monthly-art");
  if (!res.ok) throw new Error("Failed to fetch monthly arts");
  return await res.json();
}
