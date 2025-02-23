import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  pixelArtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PixelArt",
    required: true,
  },

  reason: {
    type: String,
    required: true,
    enum: ["Spam", "Hate Speech", "Inappropriate Content", "Other"],
  },

  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Rejected"],
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Report || mongoose.model("Report", ReportSchema);
