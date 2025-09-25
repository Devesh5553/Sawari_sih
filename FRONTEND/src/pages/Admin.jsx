import React, { useMemo, useState, useEffect } from 'react';
import Header from '../components/Header';
import MapView from '../components/MapView';
import { buses as allBuses } from '../data/buses';
import {
  LayoutDashboard,
  MapPin,
  Map,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Bell,
  Plug,
  Activity,
  Plus,
  Pencil,
  Trash2,
  Send,
  Download,
  Filter,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const tabs = [
  { id: 'fleet', label: 'Fleet Monitor', icon: MapPin },
  { id: 'routes', label: 'Routes & GTFS', icon: Map },
  { id: 'dispatch', label: 'Dispatch & Incidents', icon: AlertTriangle },
  { id: 'feedback', label: 'Passenger Feedback', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'api', label: 'API & Integrations', icon: Plug },
];

const Chip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
      active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
    }`}
  >
    {children}
  </button>
);

const SectionCard = ({ title, icon: Icon = LayoutDashboard, action, children }) => (
  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Icon className="w-5 h-5 text-blue-600 mr-2" />
        {title}
      </h3>
      {action}
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const Table = ({ columns, rows, rowKey = 'id', actions }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {columns.map((c) => (
            <th key={c.key} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{c.header}</th>
          ))}
          {actions ? <th className="px-4 py-3"></th> : null}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-100">
        {rows.map((r) => (
          <tr key={r[rowKey]} className="hover:bg-gray-50">
            {columns.map((c) => (
              <td key={c.key} className="px-4 py-3 text-sm text-gray-700">{c.render ? c.render(r[c.key], r) : r[c.key]}</td>
            ))}
            {actions ? (
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end space-x-2">
                  <button className="p-2 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-600"/></button>
                  <button className="p-2 rounded-lg hover:bg-gray-100"><Trash2 className="w-4 h-4 text-gray-600"/></button>
                </div>
              </td>
            ) : null}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Admin = () => {
  const [active, setActive] = useState('fleet');
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    // Map to the app's bus schema
    const mapped = allBuses.map(b => ({
      id: b.id,
      route: b.route,
      destination: b.destination,
      eta: `${b.etaMin} min`,
      location: b.location,
      occupancy: b.occupancy,
      status: b.status,
      etaMin: b.etaMin,
      start: b.start,
      estimatedJourneyMin: b.estimatedJourneyMin,
    }));
    setBuses(mapped);
  }, []);

  const fleetList = useMemo(() => buses.map(b => ({
    id: b.id,
    bus: b.route,
    dest: b.destination,
    eta: b.eta,
    status: b.status,
    occ: b.occupancy,
  })), [buses]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-6 shadow-xl mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <LayoutDashboard className="w-6 h-6 mr-2" /> Admin Console
              </h1>
              <p className="text-blue-100">Manage fleet, operations, and system health</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">Download Report</button>
              <button className="px-4 py-2 rounded-lg bg-white text-blue-700 font-semibold flex items-center">
                <Plus className="w-4 h-4 mr-2"/> New Trip
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <Chip key={t.id} active={active === t.id} onClick={() => setActive(t.id)}>
                <span className="inline-flex items-center">
                  <Icon className="w-4 h-4 mr-2" /> {t.label}
                </span>
              </Chip>
            );
          })}
        </div>

        {/* Content */}
        {active === 'fleet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SectionCard title="Live Fleet Map" icon={MapPin}>
                <MapView buses={buses} />
              </SectionCard>
            </div>
            <div className="space-y-6">
              <SectionCard title="Fleet List" icon={MapPin} action={
                <div className="flex items-center space-x-2">
                  <input className="px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Search bus/route"/>
                  <button className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm">Filter</button>
                </div>
              }>
                <Table
                  columns={[
                    { key: 'bus', header: 'Bus/Route' },
                    { key: 'dest', header: 'Destination' },
                    { key: 'eta', header: 'ETA' },
                    { key: 'status', header: 'Status' },
                    { key: 'occ', header: 'Occupancy' },
                  ]}
                  rows={fleetList}
                />
              </SectionCard>
            </div>
          </div>
        )}

        {active === 'routes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SectionCard title="Manage Routes" icon={Map} action={<button className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">Upload GTFS</button>}>
                <Table
                  columns={[
                    { key: 'id', header: 'Route ID' },
                    { key: 'name', header: 'Name' },
                    { key: 'trips', header: 'Trips' },
                    { key: 'stops', header: 'Stops' },
                  ]}
                  rows={[
                    { id: '101', name: 'City Center - Airport', trips: 24, stops: 18 },
                    { id: '105', name: 'Beach Road Express', trips: 16, stops: 9 },
                    { id: '203', name: 'Tech Park Circular', trips: 32, stops: 22 },
                  ]}
                  actions
                />
              </SectionCard>
              <SectionCard title="Trips" icon={Map}>
                <Table
                  columns={[
                    { key: 'tripId', header: 'Trip ID' },
                    { key: 'route', header: 'Route' },
                    { key: 'start', header: 'Start Time' },
                    { key: 'driver', header: 'Driver' },
                    { key: 'status', header: 'Status' },
                  ]}
                  rows={[
                    { tripId: 'T-001', route: '101', start: '08:00', driver: 'R. Singh', status: 'On Time' },
                    { tripId: 'T-002', route: '105', start: '09:10', driver: 'S. Khan', status: 'Delayed' },
                  ]}
                  actions
                />
              </SectionCard>
            </div>
            <div>
              <SectionCard title="Stops" icon={Map} action={<button className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">Add Stop</button>}>
                <ul className="space-y-3">
                  {['Central Station', 'Town Hall', 'Airport T2', 'City Mall'].map((s, i) => (
                    <li key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-gray-800">{s}</span>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 rounded hover:bg-gray-100"><Pencil className="w-4 h-4"/></button>
                        <button className="p-2 rounded hover:bg-gray-100"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </div>
          </div>
        )}

        {active === 'dispatch' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SectionCard title="Incidents" icon={AlertTriangle} action={<button className="px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">Log Incident</button>}>
                <Table
                  columns={[
                    { key: 'time', header: 'Time' },
                    { key: 'type', header: 'Type' },
                    { key: 'bus', header: 'Bus' },
                    { key: 'status', header: 'Status' },
                  ]}
                  rows={[
                    { time: '09:22', type: 'Breakdown', bus: '101', status: 'Technician Dispatched' },
                    { time: '10:05', type: 'Accident', bus: '203', status: 'Emergency Services' },
                  ]}
                  actions
                />
              </SectionCard>
              <SectionCard title="Emergency Actions" icon={AlertTriangle}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Flag Bus', 'Reassign Trip', 'Hold at Stop', 'Send Broadcast'].map((a, i) => (
                    <button key={i} className="p-3 rounded-lg border border-gray-200 hover:shadow text-sm font-medium">{a}</button>
                  ))}
                </div>
              </SectionCard>
            </div>
            <div>
              <SectionCard title="Dispatch Queue" icon={AlertTriangle}>
                <ul className="space-y-3">
                  {[
                    { id: 'Q-11', task: 'Send SMS to Route 101', eta: '2m' },
                    { id: 'Q-12', task: 'Reassign Trip T-002', eta: 'Now' },
                  ].map((q) => (
                    <li key={q.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-800">{q.task}</div>
                      <div className="text-sm text-gray-500">ETA: {q.eta}</div>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </div>
          </div>
        )}

        {/* drivers & devices section removed as requested */}

        {active === 'feedback' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SectionCard title="Passenger Feedback" icon={MessageSquare}>
                <Table
                  columns={[
                    { key: 'time', header: 'Time' },
                    { key: 'route', header: 'Route' },
                    { key: 'rating', header: 'Rating' },
                    { key: 'tags', header: 'Tags' },
                  ]}
                  rows={[
                    { id: 1, time: 'Today 10:12', route: '101', rating: '4★', tags: 'Punctuality, Cleanliness' },
                    { id: 2, time: 'Today 09:08', route: '203', rating: '2★', tags: 'Driver behavior' },
                  ]}
                />
              </SectionCard>
            </div>
            <div>
              <SectionCard title="Actions" icon={MessageSquare}>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 rounded-lg bg-gray-100">Tag & Assign</button>
                  <button className="w-full px-4 py-2 rounded-lg bg-gray-100">Escalate</button>
                  <button className="w-full px-4 py-2 rounded-lg bg-gray-100">Export</button>
                </div>
              </SectionCard>
            </div>
          </div>
        )}

        {active === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Punctuality & Headway" icon={BarChart3}>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500">On-time %</div>
                  <div className="text-3xl font-bold text-blue-600">95%</div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500">Avg Headway</div>
                  <div className="text-3xl font-bold text-blue-600">6.5m</div>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Utilization & Hotspots" icon={BarChart3}>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-500">Avg Occupancy</div>
                  <div className="text-3xl font-bold text-blue-600">68%</div>
                </div>
                <div className="p-4 border border-gray-2 00 rounded-lg">
                  <div className="text-sm text-gray-500">Hotspots</div>
                  <div className="text-3xl font-bold text-blue-600">12</div>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {active === 'notifications' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <SectionCard title="Send Notification" icon={Bell}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input className="px-3 py-2 border border-gray-200 rounded-lg" placeholder="Segment (route/stop)" />
                  <select className="px-3 py-2 border border-gray-200 rounded-lg">
                    <option>Channel: Push</option>
                    <option>Channel: SMS</option>
                    <option>Channel: Email</option>
                  </select>
                  <button className="px-3 py-2 rounded-lg bg-blue-600 text-white">Send</button>
                </div>
                <textarea className="mt-4 w-full px-3 py-2 border border-gray-200 rounded-lg" rows={4} placeholder="Message..." />
              </SectionCard>
              <SectionCard title="Templates" icon={Bell}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {['Delay notice', 'Route diversion', 'Service resumed', 'Safety advisory'].map((t, i) => (
                    <div key={i} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div className="font-medium text-gray-800">{t}</div>
                      <button className="px-3 py-1 rounded-lg bg-gray-100 text-sm">Use</button>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
            <div>
              <SectionCard title="Recent Sends" icon={Send}>
                <ul className="space-y-3">
                  {[
                    { id: 1, title: 'Delay notice - Route 101', time: 'Just now' },
                    { id: 2, title: 'Diversion - Route 203', time: '1h ago' },
                  ].map(i => (
                    <li key={i.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="font-medium text-gray-800">{i.title}</div>
                      <div className="text-sm text-gray-500">{i.time}</div>
                    </li>
                  ))}
                </ul>
              </SectionCard>
            </div>
          </div>
        )}

        {/* RBAC & audit section removed as requested */}

        {active === 'api' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="GTFS-Realtime Endpoints" icon={Plug}>
              <ul className="space-y-3">
                {[
                  { name: 'Vehicle Positions', url: '/api/gtfsrt/vehiclePositions.pb', status: 'Healthy' },
                  { name: 'Trip Updates', url: '/api/gtfsrt/tripUpdates.pb', status: 'Healthy' },
                  { name: 'Service Alerts', url: '/api/gtfsrt/serviceAlerts.pb', status: 'Degraded' },
                ].map((e, i) => (
                  <li key={i} className="p-3 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{e.name}</div>
                      <div className="text-sm text-gray-500">{e.url}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${e.status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{e.status}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
            <SectionCard title="Integrations" icon={Plug}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Partner A', 'Partner B', 'Data Lake', 'BI Tool', 'SMS Gateway', 'Email'].map((p, i) => (
                  <div key={i} className="p-3 border border-gray-200 rounded-lg text-center text-sm font-medium">{p}</div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        {/* system health section removed as requested */}
      </div>
    </div>
  );
};

export default Admin;
