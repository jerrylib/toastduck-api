import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import * as fs from "fs";
import * as path from "path";

const STATIC_DIR = path.join(process.cwd(), "static");

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { filename } = req.params;

  // Prevent path traversal attacks
  const safeName = path.basename(filename);
  if (!safeName || safeName !== filename) {
    return res.status(400).json({ error: "Invalid filename" });
  }

  const filePath = path.join(STATIC_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ success: true, deleted: safeName });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete file", detail: String(err) });
  }
}
