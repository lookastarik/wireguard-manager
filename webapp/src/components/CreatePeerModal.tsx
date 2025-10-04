import { useState, type FormEvent } from 'react';
import { supabase, type Server } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CreatePeerModalProps {
  server: Server;
  onClose: () => void;
  onCreated: () => void;
}

function generateKeyPair() {
  return {
    privateKey: Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join(''),
    publicKey: Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('')
  };
}

function getNextAvailableIP(serverAddress: string): string {
  const parts = serverAddress.split('.');
  const lastOctet = parseInt(parts[3].split('/')[0]);
  parts[3] = (lastOctet + Math.floor(Math.random() * 200) + 2).toString();
  return parts.join('.');
}

export function CreatePeerModal({ server, onClose, onCreated }: CreatePeerModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    allowed_ips: '0.0.0.0/0, ::/0',
    persistent_keepalive: 25,
    expiry_date: ''
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const keys = generateKeyPair();
      const presharedKey = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join('');

      const address_v4 = getNextAvailableIP(server.address_v4);

      const { error } = await supabase.from('peers').insert({
        server_id: server.id,
        name: formData.name,
        public_key: keys.publicKey,
        private_key: keys.privateKey,
        preshared_key: presharedKey,
        allowed_ips: formData.allowed_ips,
        address_v4,
        persistent_keepalive: formData.persistent_keepalive,
        expiry_date: formData.expiry_date || null,
        status: 'active',
        user_id: user?.id
      });

      if (error) throw error;
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create peer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Add Peer</h2>
          <p className="text-sm text-slate-600 mt-1">Create a new client for {server.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Peer Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="My Laptop"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Allowed IPs
            </label>
            <input
              type="text"
              value={formData.allowed_ips}
              onChange={(e) => setFormData({ ...formData, allowed_ips: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Use 0.0.0.0/0, ::/0 to route all traffic through VPN
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Persistent Keepalive (seconds)
            </label>
            <input
              type="number"
              value={formData.persistent_keepalive}
              onChange={(e) => setFormData({ ...formData, persistent_keepalive: parseInt(e.target.value) })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Expiry Date (optional)
            </label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:text-slate-900 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Peer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
