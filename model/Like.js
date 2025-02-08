import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pixelArtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PixelArt",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const Like = mongoose.models.Like || mongoose.model("Like", LikeSchema);

export default Like;
