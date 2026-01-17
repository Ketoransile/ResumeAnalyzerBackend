import "dotenv/config";
import mongoose from "mongoose";

const url: string | undefined = process.env.MONGO_URL;

if (!url) {
  throw new Error("MONGO_URL is not defined in your environment variables");
}

export const dbConnect = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(url);
    // console.log("✅MONGOBD CONNECTED");
  } catch (error: unknown) {
    console.error("Mongodb Connection Error ", error);
    throw error;
  }
};
