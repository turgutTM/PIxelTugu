import { NextResponse } from "next/server";
import connect from "@/db";
import PixelArt from "@/model/Portrait";

export async function GET() {
  await connect();
  const now = new Date();

  try {
    const winnerArt = await PixelArt.findOne({
      category: "monthly art",
      winner: true,
      featuredUntil: { $gte: now },
    }).populate("userId", "username profilePhoto profession");

    if (winnerArt) {
      return NextResponse.json({ arts: [winnerArt] }, { status: 200 });
    }

    const randomMonthlyArts = await PixelArt.aggregate([
      { $match: { category: "monthly art" } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      { $unwind: "$userData" },
      { $sample: { size: 10 } },
      {
        $project: {
          _id: 1,
          canvasSize: 1,
          pixels: 1,
          title: 1,
          category: 1,
          createdAt: 1,
          status: 1,
          winner: 1,
          featuredUntil: 1,

          userId: {
            _id: "$userData._id",
            username: "$userData.username",
            profilePhoto: "$userData.profilePhoto",
            profession: "$userData.profession",
          },
        },
      },
    ]);

    return NextResponse.json({ arts: randomMonthlyArts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
