import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, ShieldAlert, Coins, HelpCircle, HardHat, User, Landmark } from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';

const formatINR = (value) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  return `₹${(value / 100000).toFixed(1)} L`;
};

// Custom Recenter hook component for Leaflet
function MapViewRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true, duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
}

// Leaflet DivIcon factory for custom glowing markers
const createCustomMarker = (riskScore) => {
  const markerColor = riskScore === 'High' ? '#EF4444' : riskScore === 'Medium' ? '#F59E0B' : '#10B981';
  const glowColor = riskScore === 'High' ? 'rgba(239, 68, 68, 0.4)' : riskScore === 'Medium' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)';
  
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        position: relative;
        width: 14px;
        height: 14px;
        background-color: ${markerColor};
        border: 2px solid #111113;
        border-radius: 50%;
        box-shadow: 0 0 0 4px ${glowColor};
        cursor: pointer;
      ">
        <span style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid ${markerColor};
          opacity: 0.6;
          animation: mapPulse 1.8s infinite ease-out;
        "></span>
      </div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10]
  });
};

// Add standard pulsing animation style
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes mapPulse {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

export default function MapView({ searchQuery }) {
  const { allProjects } = useProjects();
  const [activeProject, setActiveProject] = useState(allProjects[0]);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Geographic center of India
  const [mapZoom, setMapZoom] = useState(5);

  // Filter projects based on search query
  const filtered = allProjects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectProject = (project) => {
    setActiveProject(project);
    if (project.coordinates) {
      setMapCenter(project.coordinates);
      setMapZoom(9);
    }
  };

  // Reset zoom back to default country-level view
  const resetMap = () => {
    setMapCenter([20.5937, 78.9629]);
    setMapZoom(5);
  };

  return (
    <div 
      className="grid-3" 
      style={{ 
        gridTemplateColumns: '1.15fr 2.6fr', 
        gap: '20px', 
        minHeight: 'calc(100vh - var(--topbar-height) - 100px)',
        alignItems: 'stretch'
      }}
    >
      {/* Left Column: Projects List Sidebar */}
      <div 
        className="card flex flex-col justify-between" 
        style={{ height: '620px', padding: '16px', overflow: 'hidden' }}
      >
        <div className="flex flex-col gap-3" style={{ height: '100%', overflow: 'hidden' }}>
          <div className="flex justify-between items-center">
            <div>
              <span className="label">Geographic Nodes</span>
              <h3 className="section-title mt-1">Project Coordinates</h3>
            </div>
            {mapZoom > 5 && (
              <button 
                className="btn btn-ghost" 
                style={{ fontSize: '0.72rem', padding: '2px 6px' }}
                onClick={resetMap}
              >
                Reset View
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto'}} className="flex flex-col gap-3 pr-1">
            {filtered.map((p) => (
              <div 
                key={p.id}
                onClick={() => selectProject(p)}
                className="p-3 cursor-pointer"
                style={{
                  background: activeProject.id === p.id ? 'var(--bg-active)' : 'var(--bg-elevated)',
                  border: `1px solid ${activeProject.id === p.id ? 'var(--border-strong)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all var(--transition)'
                }}
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <span className="label" style={{ fontSize: '0.62rem', fontFamily: 'monospace' }}>{p.id}</span>
                  <span 
                    className="badge"
                    style={{ 
                      fontSize: '0.62rem',
                      backgroundColor: p.status === 'Completed' ? 'var(--accent-green-dim)' : p.status === 'Delayed' ? 'var(--accent-amber-dim)' : p.status === 'Suspended' ? 'var(--accent-red-dim)' : 'var(--accent-blue-dim)',
                      color: p.status === 'Completed' ? 'var(--accent-green)' : p.status === 'Delayed' ? 'var(--accent-amber)' : p.status === 'Suspended' ? 'var(--accent-red)' : 'var(--accent-blue)',
                    }}
                  >
                    {p.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.25 }} className="mb-2">
                  {p.name}
                </div>
                <div className="flex justify-between items-center text-secondary" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <MapPin size={10} />
                    {p.village}, {p.district}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{formatINR(p.budget)}</span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '4 0px' }}>
                <HelpCircle size={24} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ fontSize: '0.78rem' }}>No project nodes found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Leaflet Map Container */}
      <div 
        className="card" 
        style={{ 
          height: '620px', 
          padding: 0, 
          overflow: 'hidden', 
          position: 'relative',
          border: '1px solid var(--border)' 
        }}
      >
        <MapContainer 
          center={mapCenter} 
          zoom={mapZoom} 
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          {/* Recenter listener */}
          <MapViewRecenter center={mapCenter} zoom={mapZoom} />

          {/* Dark Mode Tile Set - CartoDB Dark Matter */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* Markers */}
          {filtered.map((p) => {
            if (!p.coordinates) return null;
            return (
              <Marker 
                key={p.id}
                position={p.coordinates}
                icon={createCustomMarker(p.riskScore)}
                eventHandlers={{
                  click: () => {
                    setActiveProject(p);
                    setMapCenter(p.coordinates);
                    setMapZoom(9);
                  }
                }}
              >
                <Popup minWidth={240}>
                  <div style={{ fontSize: '0.8rem', padding: '2px', color: 'var(--text-primary)' }} className="flex flex-col gap-2.5">
                    <div>
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{p.id}</span>
                        <span className="badge" style={{ backgroundColor: `${p.schemeId === 'pmgsy' ? 'var(--accent-blue-dim)' : p.schemeId === 'jjm' ? 'var(--accent-cyan-dim)' : 'var(--accent-green-dim)'}`, color: `${p.schemeId === 'pmgsy' ? 'var(--accent-blue)' : p.schemeId === 'jjm' ? 'var(--accent-cyan)' : 'var(--accent-green)'}`, fontSize: '0.62rem' }}>
                          {p.scheme}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{p.name}</h4>
                    </div>
                    
                    <div className="divider" style={{ background: '#27272A' }} />

                    <div className="flex flex-col gap-1.5" style={{ fontSize: '0.72rem' }}>
                      <div className="flex items-center gap-1.5 text-secondary" style={{ color: 'var(--text-muted)' }}>
                        <MapPin size={10} />
                        <span>{p.village}, {p.district} ({p.state})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-secondary" style={{ color: 'var(--text-muted)' }}>
                        <Coins size={10} />
                        <span>Budget: <b>{formatINR(p.budget)}</b> (Spent: <b>{p.completion}%</b>)</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-secondary" style={{ color: 'var(--text-muted)' }}>
                        <HardHat size={10} />
                        <span>Contractor: <b>{p.contractor}</b></span>
                      </div>
                    </div>

                    <div className="divider" style={{ background: '#27272A' }} />

                    <div className="flex items-center justify-between" style={{ fontSize: '0.7rem' }}>
                      <span className="flex items-center gap-1" style={{ color: p.riskScore === 'High' ? 'var(--accent-red)' : p.riskScore === 'Medium' ? 'var(--accent-amber)' : 'var(--accent-green)' }}>
                        <ShieldAlert size={10} />
                        {p.riskScore} Risk
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>Status: <b>{p.status}</b></span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Floating Map Legend overlay */}
        <div 
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            zIndex: 1000,
            background: 'rgba(24, 24, 27, 0.85)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: 'var(--shadow)'
          }}
        >
          <span className="label" style={{ fontSize: '0.6rem' }}>Risk Nodes</span>
          <div className="flex items-center gap-4" style={{ fontSize: '0.74rem' }}>
            <div className="flex items-center gap-1.5">
              <span className="dot dot-green" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="dot dot-amber" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="dot dot-red" />
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
