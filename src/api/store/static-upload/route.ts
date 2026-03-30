import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import * as fs from "fs";
import * as path from "path";
const STATIC_DIR = path.join(process.cwd(), "static");

function ensureStaticDir() {
  if (!fs.existsSync(STATIC_DIR)) {
    fs.mkdirSync(STATIC_DIR, { recursive: true });
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    ensureStaticDir();

    // Medusa uses multer under the hood; files are available on req.files
    const files = (req as any).files as Express.Multer.File[] | undefined;
    const file = (req as any).file as Express.Multer.File | undefined;

    const uploaded: { name: string; size: number; url: string }[] = [];

    const processFile = (f: Express.Multer.File) => {
      const ext = path.extname(f.originalname);
      const base = path.basename(f.originalname, ext)
        .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
        .slice(0, 100);
      const timestamp = Date.now();
      const safeName = `${timestamp}-${base}${ext}`;
      const dest = path.join(STATIC_DIR, safeName);

      if (f.buffer) {
        fs.writeFileSync(dest, f.buffer);
      } else if (f.path) {
        fs.copyFileSync(f.path, dest);
        fs.unlinkSync(f.path);
      }

      uploaded.push({
        name: safeName,
        size: f.size,
        url: `/static/${safeName}`,
      });
    };

    if (files && Array.isArray(files) && files.length > 0) {
      files.forEach(processFile);
    } else if (file) {
      processFile(file);
    } else {
      return res.status(400).json({ error: "No file provided" });
    }

    res.json({ success: true, uploaded });
  } catch (err) {
    res.status(500).json({ error: "Upload failed", detail: String(err) });
  }
}
