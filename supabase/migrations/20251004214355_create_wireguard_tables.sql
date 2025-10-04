/*
  # Create WireGuard Management Schema

  1. New Tables
    - `servers`
      - `id` (uuid, primary key)
      - `name` (text, server name)
      - `endpoint` (text, server endpoint IP/domain)
      - `port` (integer, WireGuard port)
      - `public_key` (text, server public key)
      - `private_key` (text, encrypted server private key)
      - `address_v4` (text, IPv4 subnet)
      - `address_v6` (text, IPv6 subnet)
      - `dns` (text, DNS servers)
      - `mtu` (integer, MTU size)
      - `persistent_keepalive` (integer, keepalive interval)
      - `status` (text, server status)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `peers`
      - `id` (uuid, primary key)
      - `server_id` (uuid, foreign key to servers)
      - `name` (text, peer name)
      - `public_key` (text, peer public key)
      - `private_key` (text, encrypted peer private key)
      - `preshared_key` (text, preshared key for additional security)
      - `allowed_ips` (text, allowed IP ranges)
      - `address_v4` (text, assigned IPv4 address)
      - `address_v6` (text, assigned IPv6 address)
      - `endpoint` (text, peer endpoint if applicable)
      - `persistent_keepalive` (integer, keepalive interval)
      - `expiry_date` (timestamptz, when peer config expires)
      - `status` (text, peer status)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own resources
    - Users can only access their own servers and peers
*/

-- Create servers table
CREATE TABLE IF NOT EXISTS servers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  endpoint text NOT NULL,
  port integer NOT NULL DEFAULT 51820,
  public_key text NOT NULL,
  private_key text NOT NULL,
  address_v4 text NOT NULL DEFAULT '10.0.0.1/24',
  address_v6 text DEFAULT 'fd00:00:00::1/64',
  dns text DEFAULT '1.1.1.1, 1.0.0.1',
  mtu integer DEFAULT 1420,
  persistent_keepalive integer DEFAULT 25,
  status text NOT NULL DEFAULT 'inactive',
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create peers table
CREATE TABLE IF NOT EXISTS peers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id uuid NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name text NOT NULL,
  public_key text NOT NULL,
  private_key text NOT NULL,
  preshared_key text,
  allowed_ips text NOT NULL DEFAULT '0.0.0.0/0, ::/0',
  address_v4 text NOT NULL,
  address_v6 text,
  endpoint text,
  persistent_keepalive integer DEFAULT 25,
  expiry_date timestamptz,
  status text NOT NULL DEFAULT 'active',
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE peers ENABLE ROW LEVEL SECURITY;

-- Servers policies
CREATE POLICY "Users can view own servers"
  ON servers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own servers"
  ON servers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own servers"
  ON servers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own servers"
  ON servers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Peers policies
CREATE POLICY "Users can view own peers"
  ON peers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own peers"
  ON peers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own peers"
  ON peers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own peers"
  ON peers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_servers_user_id ON servers(user_id);
CREATE INDEX IF NOT EXISTS idx_peers_server_id ON peers(server_id);
CREATE INDEX IF NOT EXISTS idx_peers_user_id ON peers(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_servers_updated_at ON servers;
CREATE TRIGGER update_servers_updated_at
  BEFORE UPDATE ON servers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_peers_updated_at ON peers;
CREATE TRIGGER update_peers_updated_at
  BEFORE UPDATE ON peers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
