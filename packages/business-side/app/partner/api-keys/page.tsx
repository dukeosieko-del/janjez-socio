'use client';

import { useEffect, useState } from 'react';

interface ApiKey {
  id: string;
  key_id: string;
  key_prefix: string;
  name: string;
  description: string | null;
  scopes: string[];
  rate_limit: number;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export default function PartnerApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    scopes: ['read'],
    expires_in_days: '',
    rate_limit: 1000,
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/partner/api-keys');
      const data = await res.json();
      if (data.success) {
        setApiKeys(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/partner/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          expires_in_days: formData.expires_in_days ? parseInt(formData.expires_in_days) : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewKey(data.data.key);
        setShowCreateModal(false);
        fetchApiKeys();
        setFormData({ name: '', description: '', scopes: ['read'], expires_in_days: '', rate_limit: 1000 });
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const revokeApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/partner/api-keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchApiKeys();
      }
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate New API Key
        </button>
      </div>

      {newKey && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="font-semibold text-yellow-800 mb-2">Save your API key now!</p>
          <p className="text-sm text-yellow-700 mb-2">This key will not be shown again.</p>
          <code className="block p-2 bg-white border rounded text-sm break-all">{newKey}</code>
          <button onClick={() => setNewKey(null)} className="mt-2 text-sm text-yellow-800 underline">
            I've saved it
          </button>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scopes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate Limit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Used</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {apiKeys.map((key) => (
              <tr key={key.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{key.name}</div>
                  {key.description && <div className="text-sm text-gray-500">{key.description}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key.key_prefix}...
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key.scopes.join(', ')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key.rate_limit}/hour
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {key.revoked_at ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Revoked
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {!key.revoked_at && (
                    <button
                      onClick={() => revokeApiKey(key.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Revoke
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Create API Key</h2>
            <form onSubmit={createApiKey}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate Limit (requests/hour)</label>
                <input
                  type="number"
                  value={formData.rate_limit}
                  onChange={(e) => setFormData({ ...formData, rate_limit: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires in (days)</label>
                <input
                  type="number"
                  value={formData.expires_in_days}
                  onChange={(e) => setFormData({ ...formData, expires_in_days: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Create
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
