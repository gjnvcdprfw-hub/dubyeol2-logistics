import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { ValidationError } from "./auth";

const ALLOWED = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"]]);
const MAX_BYTES = 10 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveInboundPhoto(file: File): Promise<string> {
  const ext = ALLOWED.get(file.type);
  if (!ext) throw new ValidationError("사진은 JPG/PNG/WebP만 가능합니다");
  if (file.size > MAX_BYTES) throw new ValidationError("사진은 10MB 이하여야 합니다");
  const name = `${Date.now()}-${randomBytes(8).toString("hex")}${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
