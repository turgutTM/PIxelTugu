import { NextResponse } from "next/server";
import connect from "@/db";
import Report from "@/model/Report";

export async function POST(req) {
  try {
    await connect();
    const { userId, pixelArtId, reason } = await req.json();

    if (!userId || !pixelArtId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingReport = await Report.findOne({ userId, pixelArtId });
    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this Pixel Art" },
        { status: 400 }
      );
    }

    const newReport = await Report.create({ userId, pixelArtId, reason });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    console.error("Error reporting Pixel Art:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
