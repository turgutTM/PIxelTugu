export const fetchLikedArts = async (userId, setLikedArts, setLikeCounts) => {
  try {
    const res = await fetch(`/api/art-like?userId=${userId}`);
    if (!res.ok) throw new Error("Failed to fetch likes");
    const data = await res.json();

    const newLikedArts = {};
    const newLikeCounts = {};

    data.forEach((like) => {
      const likeUserId =
        typeof like.userId === "object"
          ? like.userId._id.toString()
          : like.userId;

      if (likeUserId === userId.toString()) {
        newLikedArts[like.pixelArtId] = true;
      }

      newLikeCounts[like.pixelArtId] =
        (newLikeCounts[like.pixelArtId] || 0) + 1;
    });

    setLikedArts(newLikedArts);
    setLikeCounts(newLikeCounts);
  } catch (err) {
    console.error("Failed to fetch liked arts:", err);
  }
};

export const handleLike = async (
  pixelArtId,
  user,
  likedArts,
  setLikedArts,
  likeCounts,
  setLikeCounts
) => {
  if (!user?._id) return;

  const isLiked = likedArts[pixelArtId];

  setLikedArts((prev) => ({ ...prev, [pixelArtId]: !isLiked }));
  setLikeCounts((prev) => ({
    ...prev,
    [pixelArtId]: isLiked
      ? (prev[pixelArtId] || 1) - 1
      : (prev[pixelArtId] || 0) + 1,
  }));

  try {
    const res = await fetch("/api/art-like", {
      method: isLiked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pixelArtId, userId: user._id }),
    });

    if (!res.ok) {
      throw new Error();
    }
  } catch (err) {
    console.error("Failed to like/unlike:", err);

    setLikedArts((prev) => ({ ...prev, [pixelArtId]: isLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [pixelArtId]: isLiked
        ? (prev[pixelArtId] || 1) + 1
        : (prev[pixelArtId] || 0) - 1,
    }));
  }
};
