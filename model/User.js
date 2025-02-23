import bcrypt from "bcrypt";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    usernameLastChangedAt: {
      type: Date,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      default: "/defaultpicture.jpg",
    },
    about: {
      type: String,
      default: "No about info",
    },
    study: {
      type: String,
      default: "No Study Info",
    },
    profession: {
      type: String,
      default: "No Profession",
    },
    contact: {
      type: String,
      default: "No Contact Info",
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    favoriteArt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PixelArt",
      default: null,
    },
    joinedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.incrementFollowers = async function () {
  this.followersCount += 1;
  await this.save();
};

UserSchema.methods.decrementFollowers = async function () {
  if (this.followersCount > 0) {
    this.followersCount -= 1;
    await this.save();
  }
};

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
