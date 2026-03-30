import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import * as fs from "fs";
import * as path from "path";

const STATIC_DIR = path.join(process.cwd(), "static");

function ensureStaticDir() {
  if (!fs.existsSync(STATIC_DIR)) {
    fs.mkdirSync(STATIC_DIR, { recursive: true });
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    ensureStaticDir();

    const entries = fs.readdirSync(STATIC_DIR);
    const files = entries
      .filter((name) => {
        const fullPath = path.join(STATIC_DIR, name);
        return fs.statSync(fullPath).isFile();
      })
      .map((name) => {
        const fullPath = path.join(STATIC_DIR, name);
        const stat = fs.statSync(fullPath);
        return {
          name,
          size: stat.size,
          sizeFormatted: formatBytes(stat.size),
          modifiedAt: stat.mtime.toISOString(),
          url: `/static/${name}`,
        };
      })
      .sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));

    res.json({ files, count: files.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to list files", detail: String(err) });
  }
}
