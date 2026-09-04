import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { extractTextFromFile } from '../../lib/cvExtract';
import { bulletsToRaw, rawToBullets } from '../../lib/constants';
import { IconTray, IconAi } from '../icons/Icons';

export default function Profile({ userId, profile, setProfile, showToast }) {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('manual');
  const [dragOver, setDragOver] = useState(false);
  const [scanFileName, setScanFileName] = useState('');
  const [scanText, setScanText] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');

  const [fullName, setFullName] = useState('');
  const [tagline, setTagline] = useState('');
  const [contact, setContact] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [saving, setSaving] = useState(false);

  const applyProfileData = (data) => {
    setFullName(data?.full_name || '');
    setTagline(data?.tagline || '');
    setContact(data?.contact || '');
    setSummary(data?.summary || '');
    setSkills(data?.skills?.length ? data.skills : []);
    setExperience(data?.experience?.length ? data.experience.map((e) => ({ ...e, bulletsRaw: bulletsToRaw(e.bullets) })) : []);
    setEducation(data?.education?.length ? data.education : []);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('profile').select('*').eq('user_id', userId).maybeSingle();
      if (!error) {
        setProfile(data);
        applyProfileData(data);
      }
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleScanFile = async (file) => {
    setScanFileName('Membaca ' + file.name + '...');
    try {
      const text = await extractTextFromFile(file);
      setScanText(text);
      setScanFileName('✓ ' + file.name);
    } catch (err) {
      setScanText('');
      setScanFileName('Gagal membaca file: ' + err.message);
    }
  };

  const runScan = async () => {
    setScanning(true);
    setScanError('');
    try {
      const { data, error } = await supabase.functions.invoke('parse-profile', { body: { cvText: scanText } });
      if (error) throw new Error(error.message || 'Gagal memanggil layanan AI.');
      if (data?.error) throw new Error(data.error);
      applyProfileData(data);
      showToast('updated', 'Form terisi otomatis', 'Cek ulang datanya lalu klik Simpan Profil.');
      setMode('manual');
    } catch (err) {
      setScanError((err.message || 'Terjadi kesalahan.') + '\nPastikan Edge Function "parse-profile" sudah di-deploy — lihat PANDUAN-TAMBAHAN.md.');
    } finally {
      setScanning(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    const payload = {
      user_id: userId,
      full_name: fullName.trim(),
      tagline: tagline.trim(),
      contact: contact.trim(),
      summary: summary.trim(),
      skills: skills.filter((s) => s.category || s.items),
      experience: experience
        .filter((x) => x.title || x.company)
        .map((x) => ({ title: x.title, company: x.company, location: x.location, dates: x.dates, bullets: rawToBullets(x.bulletsRaw) })),
      education: education.filter((x) => x.degree || x.detail),
    };
    const { data, error } = await supabase.from('profile').upsert(payload, { onConflict: 'user_id' }).select().single();
    setSaving(false);
    if (error) {
      alert('Gagal menyimpan profil: ' + error.message);
      return;
    }
    setProfile(data);
    showToast('updated', 'Profil disimpan', 'Data ini akan dipakai otomatis oleh AI Tailor CV.');
  };

  if (loading) return <div className="table-loading text-center py-16 text-sm text-inkSoft">Memuat profil...</div>;

  return (
    <div className="card p-6">
      <p className="font-display text-sm font-semibold mb-1 text-ink">Data Diri & Portofolio</p>
      <p className="text-[13px] text-inkSoft mb-4">Simpan sekali, dipakai otomatis oleh AI Tailor CV tanpa perlu upload ulang file CV tiap kali melamar.</p>

      <div className="flex gap-1.5 mb-3.5">
        <button onClick={() => setMode('manual')} className={`chip ${mode === 'manual' ? 'active' : ''}`}>
          Isi Manual
        </button>
        <button onClick={() => setMode('scan')} className={`chip ${mode === 'scan' ? 'active' : ''}`}>
          📄 Scan dari Dokumen
        </button>
      </div>

      {mode === 'scan' && (
        <div className="mb-5">
          <label
            className={`upload-zone block ${dragOver ? 'border-submitted bg-submittedBg' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files[0]) handleScanFile(e.dataTransfer.files[0]);
            }}
          >
            <input type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={(e) => e.target.files[0] && handleScanFile(e.target.files[0])} />
            <div className="flex flex-col items-center gap-1">
              <IconTray color="#5B6478" size={34} />
              <p className="text-[13px] text-inkSoft mt-1">Klik atau seret file CV ke sini (.pdf, .docx, .txt)</p>
              <p className="text-[13px] font-semibold text-ink">{scanFileName}</p>
            </div>
          </label>
          <button onClick={runScan} disabled={!scanText || scanning} className="btn-ai mt-2.5">
            {scanning ? <div className="spinner" /> : <IconAi color="#fff" size={16} />}
            {scanning ? 'Membaca & mengisi form...' : 'Scan & Isi Otomatis'}
          </button>
          {scanError && <div className="text-[12.5px] bg-rejectedBg text-rejected p-3 rounded-lg mt-2.5 whitespace-pre-line">{scanError}</div>}
          <p className="text-[11.5px] text-inkSoft mt-2">AI akan membaca dokumen ini dan mengisi form di bawah — data yang sudah ada di form saat ini akan tertimpa. Cek ulang hasilnya sebelum Simpan.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="field">
          <label>Nama Lengkap</label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div className="field">
          <label>Tagline / Peran Utama</label>
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} />
        </div>
      </div>
      <div className="field">
        <label>Kontak (kota · telepon · email · dll, pisahkan dengan " · ")</label>
        <input value={contact} onChange={(e) => setContact(e.target.value)} />
      </div>
      <div className="field">
        <label>Ringkasan Profil</label>
        <textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </div>

      <p className="text-[13px] font-semibold text-ink mt-6 mb-3 pt-4.5 border-t border-lineSoft">Keahlian</p>
      {skills.length === 0 && <p className="text-xs text-inkSoft mb-2.5">Belum ada data.</p>}
      {skills.map((s, i) => (
        <div key={i} className="bg-paper border border-line rounded-xl p-3.5 mb-2.5">
          <div className="grid grid-cols-2 gap-3 mb-2.5">
            <div className="field mb-0">
              <label>Kategori</label>
              <input value={s.category || ''} onChange={(e) => setSkills((arr) => arr.map((x, idx) => (idx === i ? { ...x, category: e.target.value } : x)))} placeholder="mis. Web Development" />
            </div>
            <div className="field mb-0">
              <label>Daftar skill (pisahkan koma)</label>
              <input value={s.items || ''} onChange={(e) => setSkills((arr) => arr.map((x, idx) => (idx === i ? { ...x, items: e.target.value } : x)))} />
            </div>
          </div>
          <button onClick={() => setSkills((arr) => arr.filter((_, idx) => idx !== i))} className="text-xs font-semibold text-rejected">
            ✕ Hapus
          </button>
        </div>
      ))}
      <button onClick={() => setSkills((arr) => [...arr, { category: '', items: '' }])} className="w-full text-center text-[13px] font-semibold text-submitted bg-submittedBg py-2.5 rounded-lg hover:opacity-85">
        + Tambah Kategori Skill
      </button>

      <p className="text-[13px] font-semibold text-ink mt-6 mb-3 pt-4.5 border-t border-lineSoft">Pengalaman Kerja</p>
      {experience.length === 0 && <p className="text-xs text-inkSoft mb-2.5">Belum ada data.</p>}
      {experience.map((x, i) => (
        <div key={i} className="bg-paper border border-line rounded-xl p-3.5 mb-2.5">
          <div className="grid grid-cols-2 gap-3 mb-2.5">
            <div className="field mb-0">
              <label>Jabatan</label>
              <input value={x.title || ''} onChange={(e) => setExperience((arr) => arr.map((y, idx) => (idx === i ? { ...y, title: e.target.value } : y)))} />
            </div>
            <div className="field mb-0">
              <label>Perusahaan</label>
              <input value={x.company || ''} onChange={(e) => setExperience((arr) => arr.map((y, idx) => (idx === i ? { ...y, company: e.target.value } : y)))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2.5">
            <div className="field mb-0">
              <label>Lokasi</label>
              <input value={x.location || ''} onChange={(e) => setExperience((arr) => arr.map((y, idx) => (idx === i ? { ...y, location: e.target.value } : y)))} />
            </div>
            <div className="field mb-0">
              <label>Rentang Tanggal</label>
              <input value={x.dates || ''} onChange={(e) => setExperience((arr) => arr.map((y, idx) => (idx === i ? { ...y, dates: e.target.value } : y)))} placeholder="2020 - Sekarang" />
            </div>
          </div>
          <div className="field mb-2.5">
            <label>Poin pencapaian (1 baris = 1 poin, format opsional "Highlight — Detail")</label>
            <textarea rows={3} value={x.bulletsRaw || ''} onChange={(e) => setExperience((arr) => arr.map((y, idx) => (idx === i ? { ...y, bulletsRaw: e.target.value } : y)))} />
          </div>
          <button onClick={() => setExperience((arr) => arr.filter((_, idx) => idx !== i))} className="text-xs font-semibold text-rejected">
            ✕ Hapus
          </button>
        </div>
      ))}
      <button
        onClick={() => setExperience((arr) => [...arr, { title: '', company: '', location: '', dates: '', bulletsRaw: '' }])}
        className="w-full text-center text-[13px] font-semibold text-submitted bg-submittedBg py-2.5 rounded-lg hover:opacity-85"
      >
        + Tambah Pengalaman
      </button>

      <p className="text-[13px] font-semibold text-ink mt-6 mb-3 pt-4.5 border-t border-lineSoft">Pendidikan</p>
      {education.length === 0 && <p className="text-xs text-inkSoft mb-2.5">Belum ada data.</p>}
      {education.map((x, i) => (
        <div key={i} className="bg-paper border border-line rounded-xl p-3.5 mb-2.5">
          <div className="grid grid-cols-2 gap-3 mb-2.5">
            <div className="field mb-0">
              <label>Jenjang / Jurusan</label>
              <input value={x.degree || ''} onChange={(e) => setEducation((arr) => arr.map((y, idx) => (idx === i ? { ...y, degree: e.target.value } : y)))} />
            </div>
            <div className="field mb-0">
              <label>Institusi & Tahun</label>
              <input value={x.detail || ''} onChange={(e) => setEducation((arr) => arr.map((y, idx) => (idx === i ? { ...y, detail: e.target.value } : y)))} />
            </div>
          </div>
          <button onClick={() => setEducation((arr) => arr.filter((_, idx) => idx !== i))} className="text-xs font-semibold text-rejected">
            ✕ Hapus
          </button>
        </div>
      ))}
      <button onClick={() => setEducation((arr) => [...arr, { degree: '', detail: '' }])} className="w-full text-center text-[13px] font-semibold text-submitted bg-submittedBg py-2.5 rounded-lg hover:opacity-85">
        + Tambah Pendidikan
      </button>

      <button disabled={saving} onClick={saveProfile} className="w-full mt-6 rounded-xl py-3 text-sm font-semibold bg-ink text-white hover:opacity-90 disabled:opacity-50">
        {saving ? 'Menyimpan...' : 'Simpan Profil'}
      </button>
    </div>
  );
}
