import mongoose from "mongoose";
import { NextResponse } from "next/server";
import PixelArt from "@/model/Portrait";
import User from "@/model/User";
import connect from "@/db";

async function verifyAdmin(req) {
  const token = req.headers.get("Authorization");
  if (
    !token ||
    token !==
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3OWM3ZjcyOTRkMGUxNjM3OWJjZjkwNCIsImVtYWlsIjoidHVndUBnbWFpbC5jb20iLCJpYXQiOjE3Mzg0ODQ4NDMsImV4cCI6MTczOTA4OTY0M30.L5rS82FrCNVkJaVQ4WgEHXobSd_7dFM1km4efcfFIIA"
  ) {
    throw new Error("Unauthorized");
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3001",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req) {
  await connect();
  try {
    const arts = await PixelArt.find({ status: "pending" }).populate(
      "userId",
      "username"
    );
    return new NextResponse(JSON.stringify(arts), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:3001",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
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
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:3001",
          "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}

export async function PATCH(req) {
    await connect();
    try {
      await verifyAdmin(req);
      const { artId, newStatus } = await req.json();
      if (!artId || !newStatus) {
        return NextResponse.json(
          { error: "artId and newStatus are required" },
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "http://localhost:3001",
              "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          }
        );
      }
      const updatedArt = await PixelArt.findByIdAndUpdate(
        artId,
        { status: newStatus },
        { new: true }
      );
      if (!updatedArt) {
        return NextResponse.json(
          { error: "Pixel art not found" },
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "http://localhost:3001",
              "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
              "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
          }
        );
      }
      return NextResponse.json(
        { message: "Status updated", updatedArt },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:3001",
            "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to update pixel art", details: error.message },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "http://localhost:3001",
            "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }
  }
  