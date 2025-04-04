import { NextResponse } from "next/server";
import connect from "@/db";
import Follow from "@/model/Follow";
import User from "@/model/User";

export async function POST(req) {
  try {
    await connect();
    const { followerId, followingId } = await req.json();

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: "Missing user information" },
        { status: 400 }
      );
    }

    if (followerId === followingId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });
    if (existingFollow) {
      return NextResponse.json(
        { message: "Already following" },
        { status: 400 }
      );
    }

    const follow = new Follow({ follower: followerId, following: followingId });
    await follow.save();
    await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });

    return NextResponse.json(
      { message: "Followed successfully!" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connect();
    const { followerId, followingId } = await req.json();

    if (!followerId || !followingId) {
      return NextResponse.json(
        { error: "Missing user information" },
        { status: 400 }
      );
    }

    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    if (!follow) {
      return NextResponse.json(
        { error: "Follow relationship not found" },
        { status: 404 }
      );
    }

    await User.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });

    return NextResponse.json(
      { message: "Unfollowed successfully!" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "userId parameter is required" },
        { status: 400 }
      );
    }

    const following = await Follow.find({ follower: userId }).populate(
      "following",
      "username followersCount"
    );
    const followers = await Follow.find({ following: userId }).populate(
      "follower",
      "username followersCount"
    );
    const user = await User.findById(userId).select("followersCount");

    return NextResponse.json(
      { following, followers, followersCount: user.followersCount },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
