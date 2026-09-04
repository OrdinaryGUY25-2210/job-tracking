import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { extractTextFromFile } from '../../lib/cvExtract';
import { downloadTailoredCvDocx, downloadAsDocx } from '../../lib/docxBuilder';
import { flattenCvPreview, profileToPlainText, todayISO } from '../../lib/constants';
import { IconTray, IconAi } from '../icons/Icons';

const TAILOR_FUNCTION_NAME = 'tailor-cv';

export default function AiTailorModal({ profile, prefill, onClose, onSaved, showToast }) {
  const hasProfile = profile && (profile.summary || profile.experience?.length);
  const [jd, setJd] = useState(prefill?.jobDescription || '');
  const [source, setSource] = useState(hasProfile ? 'profile' : 'upload');
  const [cvText, setCvText] = useState(hasProfile ? profileToPlainText(profile) : '');
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

  const canSubmit = jd.trim() && cvText && !loading;

  const handleFile = async (file) => {
    setFileName('Membaca ' + file.name + '...');
    try {
      const text = await extractTextFromFile(file);
      setCvText(text);
      setFileName('✓ ' + file.name);
    } catch (err) {
      setCvText('');
      setFileName('Gagal membaca file: ' + err.message);
    }
  };

  const runTailor = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fnError } = await supabase.functions.invoke(TAILOR_FUNCTION_NAME, {
        body: { jobDescription: jd, cvText },
      });
      if (fnError) throw new Error(fnError.message || 'Gagal memanggil layanan AI.');
      if (!data || !data.cvData || !data.cvData.name) throw new Error('Respons AI tidak lengkap.');
      setResult(data);
      setCompany(data.company || '');
      setPosition(data.position || '');
    } catch (err) {
      setError((err.message || 'Terjadi kesalahan.') + `\nPastikan Edge Function "${TAILOR_FUNCTION_NAME}" sudah di-deploy — lihat PANDUAN-LLM-GRATIS.md.`);
    } finally {
      setLoading(false);
    }
  };

  const saveApplication = async () => {
    if (!company.trim() || !position.trim()) {
      alert('Nama perusahaan dan posisi harus diisi.');
      return;
    }
    const created = await onSaved({
      company: company.trim(),
      position: position.trim(),
      date_applied: todayISO(),
      status: 'Dilamar',
      link: prefill?.jobUrl || null,
      notes: null,
      job_description: jd.trim(),
      cv_text: cvText,
      cover_letter: result?.coverLetter || null,
      tailored_cv: result?.cvData ? JSON.stringify(result.cvData) : null,
      job_url: prefill?.jobUrl || null,
      candidate_location: prefill?.candidateLocation || null,
      source: 'ai',
    });
    if (created) {
      showToast('added', 'Lamaran ditambahkan otomatis', `${position} · ${company}`);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card max-w-[640px]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-lg font-semibold text-ink">Tailor CV & Cover Letter dengan AI</h2>
          <button onClick={onClose} className="opacity-40 hover:opacity-80">
            ✕
          </button>
        </div>

        <div className="field">
          <label>Deskripsi Lowongan (JD)</label>
          <textarea rows={5} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Tempel deskripsi lowongan pekerjaan di sini..." />
        </div>

        <div className="field">
          <label>Sumber Data CV</label>
          <div className="flex gap-1.5 mb-1">
            <button
              type="button"
              disabled={!hasProfile}
              onClick={() => {
                setSource('profile');
                setCvText(profileToPlainText(profile));
              }}
              className={`chip ${source === 'profile' ? 'active' : ''}`}
            >
              Pakai Profil Tersimpan
            </button>
            <button
              type="button"
              onClick={() => {
                setSource('upload');
                setCvText('');
              }}
              className={`chip ${source === 'upload' ? 'active' : ''}`}
            >
              Upload File CV
            </button>
          </div>
          {!hasProfile && <p className="text-[11.5px] text-inkSoft mt-1.5">Profil belum diisi — isi di tab "Profil Saya" supaya tidak perlu upload file tiap kali.</p>}
        </div>

        {source === 'upload' && (
          <div className="field">
            <label>Upload CV (.pdf, .docx, atau .txt)</label>
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
                if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
              }}
            >
              <input type="file" accept=".pdf,.docx,.doc,.txt" className="hidden" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
              <div className="flex flex-col items-center gap-1">
                <IconTray color="#5B6478" size={34} />
                <p className="text-[13px] text-inkSoft mt-1">Klik atau seret file CV ke sini</p>
                <p className="text-[13px] font-semibold text-ink">{fileName}</p>
              </div>
            </label>
          </div>
        )}

        <button onClick={runTailor} disabled={!canSubmit} className="btn-ai">
          {loading ? <div className="spinner" /> : <IconAi color="#fff" size={16} />}
          {loading ? 'Memproses dengan AI...' : 'Tailor CV Sekarang'}
        </button>

        {error && <div className="text-[12.5px] bg-rejectedBg text-rejected p-3 rounded-lg mt-3 whitespace-pre-line">{error}</div>}

        {result && (
          <div className="mt-5 pt-4.5 border-t border-lineSoft">
            <div className="grid grid-cols-2 gap-3 mb-3.5">
              <div className="field">
                <label>Perusahaan</label>
                <input value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="field">
                <label>Posisi</label>
                <input value={position} onChange={(e) => setPosition(e.target.value)} />
              </div>
            </div>
            <div className="field">
              <label>CV yang Disesuaikan — layout ATS-friendly</label>
              <div className="bg-paper border border-line rounded-lg p-3 text-[12.5px] leading-relaxed text-inkSoft max-h-[180px] overflow-y-auto whitespace-pre-wrap font-mono">
                {flattenCvPreview(result.cvData)}
              </div>
              <button onClick={() => downloadTailoredCvDocx(result.cvData, `CV - ${company || 'Lamaran'}.docx`)} className="btn-secondary mt-2.5">
                ⬇ Unduh CV (.docx)
              </button>
            </div>
            <div className="field">
              <label>Surat Lamaran (Cover Letter)</label>
              <div className="bg-paper border border-line rounded-lg p-3 text-[12.5px] leading-relaxed text-inkSoft max-h-[180px] overflow-y-auto whitespace-pre-wrap font-mono">
                {result.coverLetter}
              </div>
              <button onClick={() => downloadAsDocx(result.coverLetter, `Cover Letter - ${company || 'Lamaran'}.docx`)} className="btn-secondary mt-2.5">
                ⬇ Unduh Cover Letter (.docx)
              </button>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button onClick={onClose} className="flex-1 rounded-lg py-2.5 text-sm font-medium bg-paper text-inkSoft">
                Tutup Tanpa Simpan
              </button>
              <button onClick={saveApplication} className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-ink text-white">
                Simpan sebagai Lamaran Baru
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
