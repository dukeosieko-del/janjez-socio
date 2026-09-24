"use client";

import { useState } from "react";

export interface CreatedKey {
  id: string;
  key_id: string;
  name: string;
  scopes: string[];
  rate_limit: number;
  expires_at: string | null;
  created_at: string;
  token: string;
  secret: string;
}

interface ApiKeySecretDisplayProps {
  keyData?: CreatedKey;
  keyObj?: CreatedKey;
  onClose: () => void;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="text-xs text-kenya-green hover:text-kenya-green/80 font-medium"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

export function ApiKeySecretDisplay({ keyData, keyObj, onClose }: ApiKeySecretDisplayProps) {
  const resolved = keyData ?? keyObj;
  if (!resolved) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-kenya-black/70 p-4">
      <div className="bg-kenya-black border border-kenya-green/40 rounded-2xl w-full max-w-lg">
        <div className="p-6 border-b border-kenya-white/10">
          <h2 className="text-kenya-white font-bold text-lg">API Key Created</h2>
          <p className="text-kenya-white/60 text-sm mt-1">
            Copy the token and secret below. They will not be shown again.
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-kenya-white/60">Token (Bearer)</label>
              <CopyButton value={resolved.token} label="Copy token" />
            </div>
            <code className="block w-full bg-kenya-white/5 border border-kenya-white/10 rounded-lg px-3 py-2 text-xs text-kenya-green font-mono break-all">
              {resolved.token}
            </code>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs text-kenya-white/60">Secret</label>
              <CopyButton value={resolved.secret} label="Copy secret" />
            </div>
            <code className="block w-full bg-kenya-white/5 border border-kenya-white/10 rounded-lg px-3 py-2 text-xs text-kenya-green font-mono break-all">
              {resolved.secret}
            </code>
          </div>

          <p className="text-xs text-kenya-white/50">
            Use as <code className="text-kenya-white/80">Authorization: Bearer {"<token>"}</code>.
            Key ID: <code className="text-kenya-white/70">{resolved.key_id}</code>
          </p>
        </div>

        <div className="p-6 border-t border-kenya-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="bg-kenya-green text-kenya-black font-bold text-sm px-5 py-2 rounded-xl hover:bg-kenya-green/90"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}