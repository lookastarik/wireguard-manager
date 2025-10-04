import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase, type Server, type Peer } from '../lib/supabase';
import { ServerCard } from '../components/ServerCard';
import { CreateServerModal } from '../components/CreateServerModal';
import { PeerList } from '../components/PeerList';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadServers();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedServer) {
      loadPeers(selectedServer.id);
    }
  }, [selectedServer]);

  const loadServers = async () => {
    try {
      const { data, error } = await supabase
        .from('servers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServers(data || []);
      if (data && data.length > 0 && !selectedServer) {
        setSelectedServer(data[0]);
      }
    } catch (error) {
      console.error('Error loading servers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPeers = async (serverId: string) => {
    try {
      const { data, error } = await supabase
        .from('peers')
        .select('*')
        .eq('server_id', serverId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPeers(data || []);
    } catch (error) {
      console.error('Error loading peers:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleServerCreated = () => {
    setShowCreateModal(false);
    loadServers();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">WireGuard Manager</h1>
              <p className="text-sm text-slate-600">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">Your Servers</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            Create Server
          </button>
        </div>

        {servers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-slate-600 mb-4">No servers yet. Create your first WireGuard server!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Get Started
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              {servers.map((server) => (
                <ServerCard
                  key={server.id}
                  server={server}
                  isSelected={selectedServer?.id === server.id}
                  onClick={() => setSelectedServer(server)}
                  onUpdate={loadServers}
                />
              ))}
            </div>

            <div className="lg:col-span-2">
              {selectedServer && (
                <PeerList
                  server={selectedServer}
                  peers={peers}
                  onUpdate={() => loadPeers(selectedServer.id)}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateServerModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleServerCreated}
        />
      )}
    </div>
  );
}
