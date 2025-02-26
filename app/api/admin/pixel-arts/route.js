import { NextResponse } from "next/server";
import PixelArt from "@/model/Portrait";
import connect from "@/db";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function verifyAdmin(req) {
  const token = req.headers.get("Authorization");
  if (
    !token ||
    token !== process.env.ADMIN_BEARER_TOKEN
  ) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req) {
  await connect();
  const authResponse = await verifyAdmin(req);
  if (authResponse) return authResponse;

  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;
    const search = searchParams.get("search");

    const filter = {};
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    const pixelArts = await PixelArt.find(filter)
      .populate("userId", "username")
      .skip(skip)
      .limit(limit);

    return new NextResponse(JSON.stringify(pixelArts), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("GET error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch pixel arts",
        details: error.message,
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function DELETE(req) {
  await connect();
  const authResponse = await verifyAdmin(req);
  if (authResponse) return authResponse;

  try {
    const { searchParams } = new URL(req.url);
    const artId = searchParams.get("id");
    if (!artId) {
      return new NextResponse(
        JSON.stringify({ error: "Pixel art id is required" }),
        { status: 400, headers: corsHeaders }
      );
    }
    const deletedArt = await PixelArt.findByIdAndDelete(artId);
    if (!deletedArt) {
      return new NextResponse(
        JSON.stringify({ error: "Pixel art not found" }),
        { status: 404, headers: corsHeaders }
      );
    }
    return new NextResponse(
      JSON.stringify({ message: "Pixel art deleted successfully" }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("DELETE error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to delete pixel art",
        details: error.message,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
