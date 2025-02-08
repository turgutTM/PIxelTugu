import mongoose from "mongoose";

const PixelSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  color: { type: String, required: true },
});

const PixelArtSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  canvasSize: { type: Number, required: true },
  pixels: [PixelSchema],
  title: {
    type: String,
  },
  category: {
    type: String,
    enum: ["romantic", "technology", "abstract", "nature", "monthly art"],
  },
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

const PixelArt =
  mongoose.models.PixelArt || mongoose.model("PixelArt", PixelArtSchema);

export default PixelArt;
