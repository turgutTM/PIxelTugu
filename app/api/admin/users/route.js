import { NextResponse } from "next/server";
import User from "@/model/User";
import connect from "@/db";
import bcrypt from "bcrypt";

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "http://localhost:3001",
  "Access-Control-Allow-Methods": "GET, POST,PUT, PATCH, DELETE, OPTIONS",
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
    const users = await User.find({});
    return new NextResponse(JSON.stringify(users), { status: 200, headers });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch users",
        details: error.message,
      }),
      { status: 500, headers }
    );
  }
}

export async function DELETE(req) {
  await connect();
  const authResponse = await verifyAdmin(req);
  if (authResponse) return authResponse;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers }
      );
    }

    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers,
      });
    }

    return new NextResponse(
      JSON.stringify({ message: "User deleted successfully" }),
      { status: 200, headers }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Failed to delete user",
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
    const userId = searchParams.get("id");
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "User ID is required" }),
        { status: 400, headers }
      );
    }

    const body = await req.json();
    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers,
      });
    }

    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }

    const updatableFields = [
      "email",
      "username",
      "password",
      "profilePhoto",
      "about",
      "study",
      "profession",
      "contact",
      "followersCount",
    ];

    updatableFields.forEach((key) => {
      if (body[key] !== undefined) {
        user[key] = body[key];
      }
    });

    await user.save();

    return new NextResponse(
      JSON.stringify({ message: "User updated successfully", user }),
      { status: 200, headers }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({
        error: "Failed to update user",
        details: error.message,
      }),
      { status: 500, headers }
    );
  }
}
