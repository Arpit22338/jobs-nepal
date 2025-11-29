import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = Date.now() + "_" + file.name.replaceAll(" ", "_");
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, filename);

    try {
      await writeFile(filePath, buffer);
      return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (writeError) {
      console.error("File write failed (likely due to read-only filesystem on Vercel):", writeError);
      // Fallback for Vercel deployment without cloud storage
      return NextResponse.json({ 
        url: "https://ui-avatars.com/api/?name=User&background=random",
        warning: "File upload failed due to server restrictions. Using placeholder."
      });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Error uploading file." }, { status: 500 });
  }
}
