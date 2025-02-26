import { NextResponse } from "next/server";
import PixelArt from "@/model/Portrait";
import connect from "@/db";

export async function GET(req) {
  await connect();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId)
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    const arts = await PixelArt.find({ userId, status: "approved" });
    return NextResponse.json(arts, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user's pixel arts", details: error.message },
      { status: 500 }
    );
  }
}
