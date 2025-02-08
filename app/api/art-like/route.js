import { NextResponse } from "next/server";
import Like from "@/model/Like";
import connect from "@/db";

export async function GET(req) {
  await connect();
  try {
    const { searchParams } = new URL(req.url);
    const pixelArtId = searchParams.get("pixelArtId");

    if (pixelArtId) {
      const likeCount = await Like.countDocuments({ pixelArtId });
      return NextResponse.json({ likeCount }, { status: 200 });
    }

    const likes = await Like.find().populate("userId", "username email");
    return NextResponse.json(likes, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch likes", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await connect();
  try {
    const body = await req.json();
    console.log("Received Data:", body);

    const { userId, pixelArtId } = body;

    if (!userId || !pixelArtId) {
      return NextResponse.json(
        { error: "User ID and PixelArt ID are required" },
        { status: 400 }
      );
    }

    const existingLike = await Like.findOne({ userId, pixelArtId });

    if (existingLike) {
      return NextResponse.json(
        { message: "You have already liked this art." },
        { status: 400 }
      );
    }

    const newLike = new Like({
      userId,
      pixelArtId,
    });
    await newLike.save();

    return NextResponse.json(
      { message: "Like added successfully!", like: newLike },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/art-like:", error);
    return NextResponse.json(
      { error: "Failed to add like", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  await connect();
  try {
    const body = await req.json();
    console.log("Received Data:", body);

    const { userId, pixelArtId } = body;

    if (!userId || !pixelArtId) {
      return NextResponse.json(
        { error: "User ID and PixelArt ID are required" },
        { status: 400 }
      );
    }

    const like = await Like.findOneAndDelete({ userId, pixelArtId });

    if (!like) {
      return NextResponse.json({ message: "Like not found." }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Like removed successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE /api/art-like:", error);
    return NextResponse.json(
      { error: "Failed to remove like", details: error.message },
      { status: 500 }
    );
  }
}
