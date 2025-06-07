import "dotenv/config";
import mongoose from "mongoose";

const url: string | undefined = process.env.MONGO_URL;
if (!url) {
  throw new Error("MONGO_URL is not defined in your environment variables");
}
console.log("URL from dbCOnnect is ", url);

export const dbConnect = async () => {
  try {
    await mongoose.connect(url);
    console.log("✅MONGOBD CONNECTED");
  } catch (error: unknown) {
    console.log("🚫 MOngodb COnnection Error ", error);
    process.exit(1);
  }
};
