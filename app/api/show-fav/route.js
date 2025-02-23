import { NextResponse } from "next/server";
import connect from "@/db";
import User from "@/model/User";
import PixelArt from "@/model/Portrait";

export async function PUT(request) {
  await connect();
  const { userId, pixelArtId } = await request.json();
  try {
    const user = await User.findById(userId);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    user.favoriteArt = pixelArtId;
    await user.save();
    return NextResponse.json(
      { success: true, favoriteArt: user.favoriteArt },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  await connect();
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  try {
    const user = await User.findById(userId).populate("favoriteArt");
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json({ favoriteArt: user.favoriteArt }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
