import { supabase, type Server } from '../lib/supabase';

interface ServerCardProps {
  server: Server;
  isSelected: boolean;
  onClick: () => void;
  onUpdate: () => void;
}

export function ServerCard({ server, isSelected, onClick, onUpdate }: ServerCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this server?')) return;

    try {
      const { error } = await supabase.from('servers').delete().eq('id', server.id);
      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error deleting server:', error);
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = server.status === 'active' ? 'inactive' : 'active';

    try {
      const { error } = await supabase
        .from('servers')
        .update({ status: newStatus })
        .eq('id', server.id);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Error updating server status:', error);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg shadow-blue-500/20'
          : 'border-slate-200 bg-white/80 backdrop-blur-sm hover:border-blue-300 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 mb-1">{server.name}</h3>
          <p className="text-sm text-slate-500 font-medium">{server.endpoint}:{server.port}</p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            server.status === 'active'
              ? 'bg-green-100 text-green-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {server.status}
        </span>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={handleToggleStatus}
          className="flex-1 px-4 py-2 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
        >
          {server.status === 'active' ? 'Stop' : 'Start'}
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-sm font-medium bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
