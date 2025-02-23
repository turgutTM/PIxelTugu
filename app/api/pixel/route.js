import { NextResponse } from "next/server";
import PixelArt from "@/model/Portrait";
import connect from "@/db";

export async function GET(req) {
  await connect();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const page = Number(searchParams.get("page")) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const filter = { status: "approved" };
    if (userId) {
      filter.userId = userId;
    }
    const userArts = await PixelArt.find(filter)
      .populate("userId", "username email profession profilePhoto")
      .skip(skip)
      .limit(limit);
    return NextResponse.json(userArts, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch pixel arts", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  await connect();
  try {
    const body = await req.json();
    const { title, category, userId, pixels, canvasSize } = body;
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    if (!Array.isArray(pixels)) {
      return NextResponse.json(
        { error: "Pixels must be an array" },
        { status: 400 }
      );
    }
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const count = await PixelArt.countDocuments({
      userId,
      createdAt: { $gte: oneHourAgo },
    });
    if (count >= 3) {
      return NextResponse.json(
        { error: "You can only create 3 artworks per hour" },
        { status: 429 }
      );
    }
    const nonDefaultPixels = pixels.filter(
      (pixel) => pixel.color !== "#FFFFFF"
    );
    const newArt = new PixelArt({
      title,
      userId,
      pixels: nonDefaultPixels,
      canvasSize,
      category,
    });
    await newArt.save();
    return NextResponse.json(
      { message: "Pixel art saved!", savedPixels: nonDefaultPixels },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save pixel art", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  await connect();
  try {
    const { searchParams } = new URL(req.url);
    const artId = searchParams.get("id");
    if (!artId) {
      return NextResponse.json(
        { error: "Pixel art ID is required" },
        { status: 400 }
      );
    }
    const deletedArt = await PixelArt.findByIdAndDelete(artId);
    if (!deletedArt) {
      return NextResponse.json(
        { error: "Pixel art not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Pixel art deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete pixel art", details: error.message },
      { status: 500 }
    );
  }
}
