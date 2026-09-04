export function formatRupiah(value) {
  const n = Number(value) || 0;
  return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

export const EXPENSE_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Tagihan & Utilitas',
  'Belanja',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Lainnya',
];

export const CATEGORY_COLORS = {
  'Makanan & Minuman': '#C98A2E',
  Transportasi: '#6B84A3',
  'Tagihan & Utilitas': '#B85C50',
  Belanja: '#6B5FA3',
  Hiburan: '#4C8B57',
  Kesehatan: '#2C5F76',
  Pendidikan: '#8A6D3B',
  Lainnya: '#5B6478',
};

/* Preset warna & logo-teks untuk bank/e-wallet populer di Indonesia —
   dipakai sebagai default saat pengguna menambah rekening baru, supaya
   tidak perlu isi warna manual. Pengguna tetap bisa ganti warnanya. */
export const BANK_PRESETS = {
  BCA: '#1E4FA3',
  Mandiri: '#003D79',
  BRI: '#00529C',
  BNI: '#F37021',
  DANA: '#118EEA',
  OVO: '#4C2A86',
  GoPay: '#00AED6',
  ShopeePay: '#EE4D2D',
  Jenius: '#0D8E7C',
  CIMB: '#7A1E3E',
};

export function bankColor(bankName) {
  const key = Object.keys(BANK_PRESETS).find((k) => bankName?.toUpperCase().includes(k.toUpperCase()));
  return key ? BANK_PRESETS[key] : '#1F2A44';
}

export function monthLabel(dateISO) {
  return new Date(dateISO).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
}
