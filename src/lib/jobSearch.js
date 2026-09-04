export function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = String(html || '');
  return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
}

export function timeAgo(dateStr) {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diffDays <= 0) return 'hari ini';
  if (diffDays === 1) return '1 hari lalu';
  if (diffDays < 30) return `${diffDays} hari lalu`;
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const SOURCE_BADGE_COLOR = { Remotive: '#6B84A3', RemoteOK: '#C98A2E', Arbeitnow: '#4C8B57' };

async function fetchRemotive(keyword) {
  const url = 'https://remotive.com/api/remote-jobs' + (keyword ? `?search=${encodeURIComponent(keyword)}` : '');
  const res = await fetch(url);
  if (!res.ok) throw new Error('Remotive HTTP ' + res.status);
  const data = await res.json();
  return (data.jobs || []).map((j) => ({
    title: j.title,
    company: j.company_name,
    url: j.url,
    location: j.candidate_required_location || 'Remote',
    type: j.job_type || '',
    category: j.category || '',
    dateISO: j.publication_date,
    description: j.description,
    source: 'Remotive',
  }));
}

async function fetchRemoteOk(keyword) {
  const res = await fetch('https://remoteok.com/api');
  if (!res.ok) throw new Error('RemoteOK HTTP ' + res.status);
  const raw = await res.json();
  const jobs = raw.filter((j) => j.id);
  const kw = (keyword || '').toLowerCase();
  const filtered = kw
    ? jobs.filter((j) => `${j.position} ${j.company} ${(j.tags || []).join(' ')}`.toLowerCase().includes(kw))
    : jobs;
  return filtered.slice(0, 20).map((j) => ({
    title: j.position,
    company: j.company,
    url: j.url || j.apply_url,
    location: j.location || 'Remote',
    type: (j.tags || []).find((t) => /time|contract|intern/i.test(t)) || '',
    category: (j.tags || [])[0] || '',
    dateISO: j.date,
    description: j.description,
    source: 'RemoteOK',
  }));
}

async function fetchArbeitnow(keyword) {
  const res = await fetch('https://www.arbeitnow.com/api/job-board-api');
  if (!res.ok) throw new Error('Arbeitnow HTTP ' + res.status);
  const data = await res.json();
  const jobs = data.data || [];
  const kw = (keyword || '').toLowerCase();
  const filtered = kw
    ? jobs.filter((j) => `${j.title} ${j.company_name} ${(j.tags || []).join(' ')}`.toLowerCase().includes(kw))
    : jobs;
  return filtered.slice(0, 20).map((j) => ({
    title: j.title,
    company: j.company_name,
    url: j.url,
    location: j.remote ? 'Remote' : j.location || '-',
    type: (j.job_types || [])[0] || '',
    category: (j.tags || [])[0] || '',
    dateISO: new Date(j.created_at * 1000).toISOString(),
    description: j.description,
    source: 'Arbeitnow',
  }));
}

/* Menggabungkan hasil dari 3 sumber gratis. Kalau salah satu gagal
   (diblokir/limit), hasil dari sumber lain tetap dikembalikan. */
export async function searchJobs(keyword) {
  const results = await Promise.allSettled([fetchRemotive(keyword), fetchRemoteOk(keyword), fetchArbeitnow(keyword)]);
  const sourceNames = ['Remotive', 'RemoteOK', 'Arbeitnow'];
  let merged = [];
  const failedSources = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') merged = merged.concat(r.value);
    else failedSources.push(sourceNames[i]);
  });
  merged.sort((a, b) => new Date(b.dateISO) - new Date(a.dateISO));
  return { jobs: merged.slice(0, 40), failedSources };
}
