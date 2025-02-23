import { NextResponse } from "next/server";
import PixelArt from "@/model/Portrait";
import User from "@/model/User";
import connect from "@/db";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function verifyAdmin(req) {
  const token = req.headers.get("Authorization");
  if (
    !token ||
    token !==
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OWM3ZjcyOTRkMGUxNjM3OWJjZjkwNCIsImVtYWlsIjoidHVndUBnbWFpbC5jb20iLCJpYXQiOjE3Mzg0ODQ4NDMsImV4cCI6MTczOTA4OTY0M30.L5rS82FrCNVkJaVQ4WgEHXobSd_7dFM1km4efcfFIIA"
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
    const artCount = await PixelArt.countDocuments();
    const userCount = await User.countDocuments();
    return new NextResponse(JSON.stringify({ artCount, userCount }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("GET error:", error);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch counts",
        details: error.message,
      }),
      { status: 500, headers: corsHeaders }
    );
  }
}
