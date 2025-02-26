import { NextResponse } from "next/server";
import Report from "@/model/Report";
import connect from "@/db";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
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
    const reports = await Report.find({})
      .populate("userId", "username email")
      .populate("pixelArtId", "title");

    return new NextResponse(JSON.stringify(reports), { status: 200, headers });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch reports",
        details: error.message,
      }),
      { status: 500, headers }
    );
  }
}
