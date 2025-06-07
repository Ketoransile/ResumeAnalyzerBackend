// File: types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string | null;
        sessionId: string | null;
        orgId: string | null;
        user?: any;
        organization?: any;
      };
      file?: import("multer").File;
      files?: import("multer").File[];
    }
  }
}

export {}; // <-- Important to make the file a module and avoid redeclaration errors
