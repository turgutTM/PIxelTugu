import { NextResponse } from "next/server";
import User from "@/model/User";
import PixelArt from "@/model/Portrait";
import Report from "@/model/Report";
import Follow from "@/model/Follow";
import Favorite from "@/model/Favorite";
import connect from "@/db";
import mongoose from "mongoose";

export async function GET(req) {
  await connect();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user data", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  await connect();
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    const body = await req.json();

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updatedData = {};

    if (body.username && body.username !== currentUser.username) {
      const lastChanged = currentUser.usernameLastChangedAt;
      const oneMonth = 30 * 24 * 60 * 60 * 1000;

      if (
        lastChanged &&
        Date.now() - new Date(lastChanged).getTime() < oneMonth
      ) {
        return NextResponse.json(
          { error: "Only once in a month" },
          { status: 429 }
        );
      }

      updatedData.username = body.username;
      updatedData.usernameLastChangedAt = new Date();
    }

    if (body.email) updatedData.email = body.email;
    if (body.profilePhoto) updatedData.profilePhoto = body.profilePhoto;
    if (body.profession) updatedData.profession = body.profession;
    if (body.study) updatedData.study = body.study;
    if (body.contact) updatedData.contact = body.contact;
    if (body.about) updatedData.about = body.about;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user data", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  await connect();
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid User ID" }, { status: 400 });
    }

    await PixelArt.deleteMany({ userId: userId }, { session });

    await Report.deleteMany({ userId: userId }, { session });

    await Follow.deleteMany(
      { $or: [{ follower: userId }, { following: userId }] },
      { session }
    );

    await Favorite.deleteMany({ userId: userId }, { session });

    const deletedUser = await User.findByIdAndDelete(userId, { session });
    if (!deletedUser) {
      await session.abortTransaction();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await session.commitTransaction();
    return NextResponse.json(
      { message: "User and related data deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    await session.abortTransaction();
    return NextResponse.json(
      { error: "Failed to delete user", details: error.message },
      { status: 500 }
    );
  } finally {
    session.endSession();
  }
}
