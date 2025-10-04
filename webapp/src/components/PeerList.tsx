import { useState } from 'react';
import { supabase, type Server, type Peer } from '../lib/supabase';
import { CreatePeerModal } from './CreatePeerModal';
import { PeerConfigModal } from './PeerConfigModal';

interface PeerListProps {
  server: Server;
  peers: Peer[];
  onUpdate: () => void;
}

export function PeerList({ server, peers, onUpdate }: PeerListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<Peer | null>(null);

  const handleDelete = async (peerId: string) => {
    if (!confirm('Are you sure you want to delete this peer?')) return;

    try {
      const { error } = await supabase.from('peers').delete().eq('id', peerId);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting peer:', error);
    }
  };

  const handlePeerCreated = () => {
    setShowCreateModal(false);
    onUpdate();
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Peers</h3>
            <p className="text-sm text-slate-600 mt-1">
              Connected clients for {server.name}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            Add Peer
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-200">
        {peers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-600 mb-4">No peers configured yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Add First Peer
            </button>
          </div>
        ) : (
          peers.map((peer) => (
            <div key={peer.id} className="p-4 hover:bg-slate-50 transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-slate-800">{peer.name}</h4>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded ${
                        peer.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {peer.status}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">IPv4:</span> {peer.address_v4}
                    </p>
                    {peer.address_v6 && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">IPv6:</span> {peer.address_v6}
                      </p>
                    )}
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">Allowed IPs:</span> {peer.allowed_ips}
                    </p>
                    {peer.expiry_date && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">Expires:</span>{' '}
                        {new Date(peer.expiry_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedPeer(peer)}
                    className="px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded transition"
                  >
                    Config
                  </button>
                  <button
                    onClick={() => handleDelete(peer.id)}
                    className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreatePeerModal
          server={server}
          onClose={() => setShowCreateModal(false)}
          onCreated={handlePeerCreated}
        />
      )}

      {selectedPeer && (
        <PeerConfigModal
          server={server}
          peer={selectedPeer}
          onClose={() => setSelectedPeer(null)}
        />
      )}
    </div>
  );
}
