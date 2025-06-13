import mongoose from "mongoose";

export interface IUser {
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
}
export const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImageUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);
export const User = mongoose.models.User || mongoose.model("User", userSchema);
