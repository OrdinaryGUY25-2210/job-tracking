export const STATUS_META = {
  Dilamar: { label: 'Dilamar', color: '#6B84A3', bg: '#EAEEF4' },
  Diproses: { label: 'Sedang Diproses', color: '#C98A2E', bg: '#FBF0DE' },
  Interview: { label: 'Interview', color: '#6B5FA3', bg: '#EFEAF7' },
  Diterima: { label: 'Diterima', color: '#4C8B57', bg: '#E7F1E7' },
  Ditolak: { label: 'Ditolak', color: '#B85C50', bg: '#F7E9E7' },
};

export const CV_THEME = {
  navy: '11223C',
  tagline: '2C5F76',
  gray: '4C4C4C',
  black: '1A1A1A',
};
export const CV_FONT = 'Calibri';

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
export function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function fmtDateTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/* Bullet bisa berupa string lama (backward-compat) atau objek {highlight, detail}. */
export function bulletToText(b) {
  if (typeof b === 'string') return b;
  if (!b) return '';
  return b.detail ? `${b.highlight} — ${b.detail}` : b.highlight || '';
}
export function bulletsToRaw(bullets) {
  return (bullets || []).map(bulletToText).join('\n');
}
export function rawToBullets(raw) {
  return String(raw || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(' — ');
      if (idx === -1) return { highlight: line, detail: '' };
      return { highlight: line.slice(0, idx).trim(), detail: line.slice(idx + 3).trim() };
    });
}

export function flattenCvPreview(cv) {
  const lines = [];
  lines.push(cv.name || '');
  if (cv.tagline) lines.push(cv.tagline);
  if (cv.contact) lines.push(cv.contact);
  lines.push('');
  if (cv.summary) {
    lines.push('RINGKASAN PROFIL');
    lines.push(cv.summary);
    lines.push('');
  }
  if (cv.skills?.length) {
    lines.push('KEAHLIAN');
    cv.skills.forEach((s) => lines.push(`${s.category}: ${s.items}`));
    lines.push('');
  }
  if (cv.experience?.length) {
    lines.push('PENGALAMAN KERJA');
    cv.experience.forEach((e) => {
      lines.push(`${e.title} — ${e.company}${e.location ? ' — ' + e.location : ''}${e.dates ? '  (' + e.dates + ')' : ''}`);
      (e.bullets || []).forEach((b) => lines.push(`- ${bulletToText(b)}`));
    });
    lines.push('');
  }
  if (cv.projects?.length) {
    lines.push('PROYEK PILIHAN');
    cv.projects.forEach((p) => {
      lines.push(p.title);
      (p.bullets || []).forEach((b) => lines.push(`- ${bulletToText(b)}`));
    });
    lines.push('');
  }
  if (cv.education?.length) {
    lines.push('PENDIDIKAN');
    cv.education.forEach((ed) => lines.push(`${ed.degree} — ${ed.detail}`));
  }
  return lines.join('\n');
}

export function profileToPlainText(p) {
  if (!p) return '';
  const lines = [p.full_name, p.tagline, p.contact, '', p.summary, ''];
  (p.skills || []).forEach((s) => lines.push(`${s.category}: ${s.items}`));
  lines.push('');
  (p.experience || []).forEach((e) => {
    lines.push(`${e.title} — ${e.company} — ${e.location} (${e.dates})`);
    (e.bullets || []).forEach((b) => lines.push(`- ${bulletToText(b)}`));
  });
  lines.push('');
  (p.education || []).forEach((ed) => lines.push(`${ed.degree} — ${ed.detail}`));
  return lines.filter(Boolean).join('\n');
}

export function looksLikeHeading(line) {
  if (!line || line.length > 45) return false;
  if (/[.,;]$/.test(line)) return false;
  const wordCount = line.trim().split(/\s+/).length;
  if (wordCount > 6) return false;
  const isAllCaps = line === line.toUpperCase() && /[A-Z]/.test(line);
  const isTitleCasePhrase = /^[A-Z][a-zA-Z\s&/-]*:?$/.test(line);
  return isAllCaps || isTitleCasePhrase;
}
