import mongoose from "mongoose";

const FavoriteSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

FavoriteSchema.index({ userId: 1, pixelArtId: 1 }, { unique: true });

const Favorite =
  mongoose.models.Favorite || mongoose.model("Favorite", FavoriteSchema);

export default Favorite;
