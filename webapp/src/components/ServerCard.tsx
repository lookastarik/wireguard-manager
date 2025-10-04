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
      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-800">{server.name}</h3>
          <p className="text-sm text-slate-600">{server.endpoint}:{server.port}</p>
        </div>
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            server.status === 'active'
              ? 'bg-green-100 text-green-800'
              : 'bg-slate-100 text-slate-800'
          }`}
        >
          {server.status}
        </span>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={handleToggleStatus}
          className="flex-1 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition"
        >
          {server.status === 'active' ? 'Stop' : 'Start'}
        </button>
        <button
          onClick={handleDelete}
          className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
