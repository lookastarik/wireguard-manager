import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Server {
  id: string;
  name: string;
  endpoint: string;
  port: number;
  public_key: string;
  private_key: string;
  address_v4: string;
  address_v6: string | null;
  dns: string;
  mtu: number;
  persistent_keepalive: number;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Peer {
  id: string;
  server_id: string;
  name: string;
  public_key: string;
  private_key: string;
  preshared_key: string | null;
  allowed_ips: string;
  address_v4: string;
  address_v6: string | null;
  endpoint: string | null;
  persistent_keepalive: number;
  expiry_date: string | null;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
