import { NextResponse } from "next/server";
import connect from "@/db";
import Favorite from "@/model/Favorite";

export async function GET(req) {
  await connect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  try {
    const favorites = await Favorite.find({ userId }).populate("pixelArtId");
    return NextResponse.json({ favorites });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  await connect();
  const { userId, pixelArtId } = await req.json();
  if (!userId || !pixelArtId)
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  try {
    const favorite = await Favorite.create({ userId, pixelArtId });
    return NextResponse.json({ success: true, favorite });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await connect();
  const { userId, pixelArtId } = await req.json();
  if (!userId || !pixelArtId)
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  try {
    const deletedFavorite = await Favorite.findOneAndDelete({
      userId,
      pixelArtId,
    });
    if (!deletedFavorite)
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
