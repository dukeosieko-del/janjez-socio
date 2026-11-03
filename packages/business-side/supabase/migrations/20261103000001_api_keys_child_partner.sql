-- API Keys table for partners and child panel users
-- Secure key generation with hashed storage

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  child_user_id UUID REFERENCES child_users(id) ON DELETE CASCADE,
  panel_id UUID REFERENCES child_panels(id) ON DELETE CASCADE,
  key_id TEXT NOT NULL UNIQUE,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'API Key',
  description TEXT,
  scopes TEXT[] DEFAULT ARRAY['read']::TEXT[],
  rate_limit INTEGER DEFAULT 1000 CHECK (rate_limit > 0),
  last_used_at TIMESTAMPTZ,
  last_used_ip TEXT,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT api_keys_owner_check CHECK (
    (user_id IS NOT NULL AND partner_id IS NOT NULL AND child_user_id IS NULL) OR
    (user_id IS NULL AND partner_id IS NULL AND child_user_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_id ON api_keys(key_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_partner ON api_keys(partner_id) WHERE partner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_api_keys_child_user ON api_keys(child_user_id) WHERE child_user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_api_keys_revoked ON api_keys(revoked_at);
CREATE INDEX IF NOT EXISTS idx_api_keys_expires ON api_keys(expires_at);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_service_only" ON api_keys FOR ALL USING (false) WITH CHECK (false);

CREATE OR REPLACE FUNCTION update_api_keys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_api_keys_updated_at();
