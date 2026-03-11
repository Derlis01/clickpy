import { registerAs } from '@nestjs/config';

export const cloudflareConfig = registerAs('cloudflare', () => ({
  r2Key: process.env.CLOUDFLARE_R2_KEY,
  r2Secret: process.env.CLOUDFLARE_R2_SECRET,
  endpoint: process.env.CLOUDFLARE_ENDPOINT,
  publicBucketUrl: process.env.CLOUDFLARE_PUBLIC_BUCKET_URL,
  bucketName: process.env.CLOUDFLARE_BUCKET_NAME,
}));
