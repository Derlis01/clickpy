import { registerAs } from '@nestjs/config';

export const supabaseConfig = registerAs('supabase', () => ({
  url: process.env.SUPABASE_URL,
  secretKey: process.env.SUPABASE_SECRET_KEY,
  jwtSecret: process.env.SUPABASE_JWT_SECRET,
}));
