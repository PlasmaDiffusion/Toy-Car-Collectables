import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

export const ourFileRouter = {
  carImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 8,
    },
  })
    .middleware(async () => {
      const session = await auth();
      // isAdmin is augmented onto the session in auth.ts
      const user = session?.user as (typeof session)["user"] & {
        isAdmin?: boolean;
      };
      if (!user?.isAdmin) throw new Error("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
