import { NextResponse } from "next/server";
import { auth } from "@/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

/**
 * POST /api/v1/uploads
 * Accepts multipart/form-data with a "file" field, writes to public/uploads,
 * and returns the static URL path for academic submission attachments.
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { data: null, error: { message: "Authentication required." } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { data: null, error: { message: "No valid file uploaded." } },
        { status: 400 }
      );
    }

    const blob = file as Blob;
    const originalName = (file as { name?: string }).name || "document.pdf";
    const extension = path.extname(originalName) || ".pdf";
    const sanitizedBase = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    const uniqueId = crypto.randomBytes(6).toString("hex");
    const filename = `${sanitizedBase}-${uniqueId}${extension}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, filename);
    const buffer = Buffer.from(await blob.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    return NextResponse.json(
      {
        data: {
          fileUrl,
          filename,
          sizeBytes: buffer.length,
        },
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { data: null, error: { message: "File upload failed." } },
      { status: 500 }
    );
  }
}
