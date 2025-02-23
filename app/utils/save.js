export async function addFavorite(userId, pixelArtId) {
  const res = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, pixelArtId }),
  });
  if (!res.ok) throw new Error("Failed to add favorite");
  return await res.json();
}
export async function removeFavorite(userId, pixelArtId) {
  const res = await fetch("/api/favorites", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, pixelArtId }),
  });
  if (!res.ok) throw new Error("Failed to remove favorite");
  return await res.json();
}
