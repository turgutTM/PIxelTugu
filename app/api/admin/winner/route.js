import { NextResponse } from "next/server";
import connect from "@/db";
import PixelArt from "@/model/Portrait";
import mongoose from "mongoose";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function verifyAdmin(req) {
  const token = req.headers.get("Authorization");
  if (!token || token !== process.env.ADMIN_BEARER_TOKEN) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers,
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(req) {
  await connect();
  const authResponse = await verifyAdmin(req);
  if (authResponse) return authResponse;
  try {
    const monthlyArts = await PixelArt.find({
      category: "monthly art",
    }).populate("userId", "username");
    return new NextResponse(JSON.stringify(monthlyArts), {
      status: 200,
      headers,
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch monthly arts",
        details: error.message,
      }),
      { status: 500, headers }
    );
  }
}

export async function PUT(req) {
  await connect();
  const authResponse = await verifyAdmin(req);
  if (authResponse) return authResponse;
  try {
    const { searchParams } = new URL(req.url);
    const pixelArtId = searchParams.get("pixelArtId");
    if (!pixelArtId || !mongoose.Types.ObjectId.isValid(pixelArtId)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid PixelArt ID" }),
        { status: 400, headers }
      );
    }
    await PixelArt.updateMany(
      { winner: true, _id: { $ne: pixelArtId } },
      { winner: false }
    );
    const updatedPixelArt = await PixelArt.findByIdAndUpdate(
      pixelArtId,
      {
        winner: true,
        featuredUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      { new: true }
    );
    if (!updatedPixelArt) {
      return new NextResponse(JSON.stringify({ error: "PixelArt not found" }), {
        status: 404,
        headers,
      });
    }
    return new NextResponse(JSON.stringify(updatedPixelArt), {
      status: 200,
      headers,
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Failed to update PixelArt",
        details: error.message,
      }),
      { status: 500, headers }
    );
  }
}
