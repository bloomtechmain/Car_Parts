import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '../config/r2';
import { v4 as uuidv4 } from 'uuid';

export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<string> {
  const ext = originalName.split('.').pop() || 'jpg';
  const key = `replies/${uuidv4()}.${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}
