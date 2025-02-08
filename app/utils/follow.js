export async function getFollowingList(userId) {
    if (!userId) return {};
    try {
      const res = await fetch(`/api/pursue?userId=${userId}`);
      if (!res.ok) throw new Error("Error fetching following list");
      const data = await res.json();
      const followingMap = {};
      data.following.forEach((item) => {
        const followedUserId = item.following._id;
        followingMap[followedUserId] = true;
      });
      return followingMap;
    } catch (error) {
      console.error(error);
      return {};
    }
  }
  
  export async function followUser(followerId, followingId) {
    try {
      const res = await fetch("/api/pursue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId, followingId }),
      });
      if (!res.ok) throw new Error("Failed to follow user");
      return await res.json();
    } catch (error) {
      console.error("followUser error:", error);
      throw error;
    }
  }
  
  export async function unfollowUser(followerId, followingId) {
    try {
      const res = await fetch("/api/pursue", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId, followingId }),
      });
      if (!res.ok) throw new Error("Failed to unfollow user");
      return await res.json();
    } catch (error) {
      console.error("unfollowUser error:", error);
      throw error;
    }
  }
  