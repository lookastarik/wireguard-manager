import { useEffect, useRef } from 'react';
import type { Server, Peer } from '../lib/supabase';
import QRCode from 'qrcode';

interface PeerConfigModalProps {
  server: Server;
  peer: Peer;
  onClose: () => void;
}

export function PeerConfigModal({ server, peer, onClose }: PeerConfigModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const config = `[Interface]
PrivateKey = ${peer.private_key}
Address = ${peer.address_v4}${peer.address_v6 ? `, ${peer.address_v6}` : ''}
DNS = ${server.dns}
MTU = ${server.mtu}

[Peer]
PublicKey = ${server.public_key}
${peer.preshared_key ? `PresharedKey = ${peer.preshared_key}` : ''}
Endpoint = ${server.endpoint}:${server.port}
AllowedIPs = ${peer.allowed_ips}
PersistentKeepalive = ${peer.persistent_keepalive}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, config, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      }).catch((err) => console.error('Error generating QR code:', err));
    }
  }, [config]);

  const handleDownload = () => {
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${peer.name}.conf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(config);
    alert('Configuration copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Peer Configuration</h2>
          <p className="text-sm text-slate-600 mt-1">{peer.name}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <canvas ref={canvasRef} className="border border-slate-200 rounded-lg"></canvas>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Configuration File
            </label>
            <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm overflow-x-auto">
              {config}
            </pre>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Download Config
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">How to use:</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Scan the QR code with your WireGuard mobile app, or</li>
              <li>Download the configuration file and import it into WireGuard</li>
              <li>Connect to the VPN from your device</li>
            </ol>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
