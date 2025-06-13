// import { cloudinary } from "../config/cloudinary";

// export const uploadToCloudinary = (
//   userId: string,
//   fileBuffer: Buffer,
//   fileName: string
// ): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         resource_type: "raw",
//         folder: "resume-uploads",
//         public_id: `${userId}_${Date.now()}_${fileName}`,
//       },
//       (error, result) => {
//         if (error) {
//           console.error("Cloudinary upload error:", error);
//           reject(new Error("Failed to upload resume to cloud storage."));
//         } else if (!result?.secure_url) {
//           reject(new Error("Cloudinary upload did not return a result URL."));
//         } else {
//           resolve(result.secure_url);
//         }
//       }
//     );

//     stream.end(fileBuffer);
//   });
// };
import { cloudinary } from "../config/cloudinary";

export const uploadToCloudinary = (
  userId: string,
  fileBuffer: Buffer,
  fileName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const sanitizedFileName = fileName.replace(/[^a-z0-9_.-]/gi, "_");

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "resume-uploads",
        public_id: `${userId}_${Date.now()}_${sanitizedFileName}`,
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary upload error:", error);
          reject(new Error("Failed to upload resume to cloud storage."));
        } else if (!result?.secure_url) {
          console.error("❌ No secure_url returned from Cloudinary:", result);
          reject(new Error("Cloudinary upload did not return a result URL."));
        } else {
          console.log("✅ Cloudinary upload success:", result.secure_url);
          resolve(result.secure_url);
        }
      }
    );

    stream.end(fileBuffer); // make sure buffer is valid
  });
};
