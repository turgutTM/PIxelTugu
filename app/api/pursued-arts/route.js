import { NextResponse } from "next/server";
import PixelArt from "@/model/Portrait";
import Follow from "@/model/Follow";
import connect from "@/db";
import mongoose from "mongoose";

export async function GET(req) {
  await connect();

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    const following = await Follow.find({ follower: userId }).select(
      "following"
    );

    if (!following.length) {
      return NextResponse.json(
        { pixelArts: [], message: "User is not following anyone" },
        { status: 200 }
      );
    }

    const followingUserIds = following.map((f) => f.following);

    const pixelArts = await PixelArt.find({
      userId: { $in: followingUserIds },
      status: "approved",
    }).populate("userId", "username profilePhoto");

    return NextResponse.json({ pixelArts }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pixel arts", details: error.message },
      { status: 500 }
    );
  }
}
