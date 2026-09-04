import { IconTray, IconApplied, IconHourglass, IconInterview, IconBadgeCheck, IconBadgeX } from '../icons/Icons';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
        {icon}
      </div>
      <div>
        <p className="font-mono text-2xl font-semibold leading-none text-ink">{value}</p>
        <p className="text-xs mt-1.5 text-inkSoft font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function StatsGrid({ applications }) {
  const total = applications.length;
  const count = (s) => applications.filter((a) => a.status === s).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-6">
      <StatCard icon={<IconTray color="#1F2A44" />} label="Total Lamaran" value={total} color="#1F2A44" />
      <StatCard icon={<IconApplied />} label="Dilamar" value={count('Dilamar')} color="#6B84A3" />
      <StatCard icon={<IconHourglass />} label="Diproses" value={count('Diproses')} color="#C98A2E" />
      <StatCard icon={<IconInterview />} label="Interview" value={count('Interview')} color="#6B5FA3" />
      <StatCard icon={<IconBadgeCheck />} label="Diterima" value={count('Diterima')} color="#4C8B57" />
      <StatCard icon={<IconBadgeX />} label="Ditolak" value={count('Ditolak')} color="#B85C50" />
    </div>
  );
}
