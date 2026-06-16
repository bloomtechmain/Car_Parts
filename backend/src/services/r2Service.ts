import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3001}`;

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  _mimeType: string
): Promise<string> {
  const ext = path.extname(originalName) || '.jpg';
  const filename = `${uuidv4()}${ext}`;
  const repliesDir = path.join(UPLOAD_DIR, 'replies');

  await fs.mkdir(repliesDir, { recursive: true });
  await fs.writeFile(path.join(repliesDir, filename), buffer);

  return `${BACKEND_URL}/uploads/replies/${filename}`;
}
