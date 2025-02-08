import { NextResponse } from "next/server";
import PixelArt from "@/model/Portrait";
import connect from "@/db";

export async function GET(req) {
  await connect();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const filter = { status: "approved" };
    if (userId) {
      filter.userId = userId;
    }

    const userArts = await PixelArt.find(filter).populate(
      "userId",
      "username email profession"
    );

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
    console.log("Received Data:", body);

    const { title, category, userId, pixels, canvasSize } = body;

    if (!userId) {
      console.error("Missing userId in request");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(pixels)) {
      console.error("Pixels must be an array!");
      return NextResponse.json(
        { error: "Pixels must be an array" },
        { status: 400 }
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
    console.error("Error in POST /api/pixel:", error);
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
    console.error("Error in DELETE /api/pixel:", error);
    return NextResponse.json(
      { error: "Failed to delete pixel art", details: error.message },
      { status: 500 }
    );
  }
}
