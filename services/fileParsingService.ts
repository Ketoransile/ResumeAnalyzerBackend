import pdf from "pdf-parse";

export async function parseResumeFile(
  fileBuffer: Buffer,
  mimetype: string
): Promise<string> {
  switch (mimetype) {
    case "application/pdf":
      const data = await pdf(fileBuffer);
      return data.text;
    default:
      throw new Error("Unsupported file type for parsing");
  }
}
