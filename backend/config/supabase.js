import { env } from "./env.js";

export const supabaseUrl = env.SUPABASE_URL;
export const supabaseKey =
  env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_KEY || env.SUPABASE_ANON_KEY;
export const supabaseBucket = env.SUPABASE_BUCKET || "edublog";
