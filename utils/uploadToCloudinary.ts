import { cloudinary } from "../config/cloudinary";

export const uploadToCloudinary = (
  userId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "resume-uploads",
        public_id: `${userId}_${Date.now()}_${fileName}`,
      },
      (error, result) => {
        if (error) {
          reject(new Error("Failed to upload resume to cloud storage."));
        } else if (!result?.secure_url) {
          reject(new Error("Cloudinary upload did not return a result URL."));
        } else {
          resolve(result.secure_url);
        }
      }
    );

    stream.end(fileBuffer);
  });
};
