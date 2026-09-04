import { useState } from 'react';
import { useApplications } from '../../hooks/useApplications';
import StatsGrid from './StatsGrid';
import Charts from './Charts';
import ApplicationsTable from './ApplicationsTable';
import ApplicationModal from './ApplicationModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import InterviewScheduleModal from './InterviewScheduleModal';
import AiTailorModal from './AiTailorModal';
import SendEmailModal from './SendEmailModal';
import JobSearch from './JobSearch';
import Profile from './Profile';

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'search', label: 'Cari Lowongan' },
  { key: 'profile', label: 'Profil Saya' },
];

export default function LamaranApp({ userId, profile, setProfile, showToast }) {
  const { applications, loaded, storageError, createApplication, updateApplication, deleteApplication } = useApplications(userId);

  const [tab, setTab] = useState('dashboard');
  const [modalApp, setModalApp] = useState(undefined); // undefined = closed, null = new, object = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [interviewTarget, setInterviewTarget] = useState(null);
  const [aiTailorPrefill, setAiTailorPrefill] = useState(undefined); // undefined = closed
  const [sendTarget, setSendTarget] = useState(null);

  const handleStatusChange = async (app, newStatus) => {
    if (newStatus === 'Interview') {
      setInterviewTarget(app);
      return;
    }
    const updated = await updateApplication(app.id, { status: newStatus });
    if (updated) {
      const iconKey = newStatus === 'Diterima' ? 'accepted' : newStatus === 'Ditolak' ? 'rejected' : newStatus === 'Dilamar' ? 'added' : 'updated';
      showToast(iconKey, 'Status diperbarui', `${app.company} → ${newStatus}`);
    }
  };

  const handleSaveForm = async (form) => {
    if (form.id) {
      const updated = await updateApplication(form.id, form);
      if (updated) {
        showToast('updated', 'Lamaran diperbarui', `${form.position} · ${form.company}`);
        setModalApp(undefined);
      }
    } else {
      const created = await createApplication(form);
      if (created) {
        showToast('added', 'Lamaran ditambahkan', `${form.position} · ${form.company}`);
        setModalApp(undefined);
      }
    }
  };

  const confirmDelete = async () => {
    const app = deleteTarget;
    const ok = await deleteApplication(app.id);
    if (ok) {
      showToast('deleted', 'Lamaran dihapus', `${app.position} · ${app.company}`);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="app-section" style={{ animation: 'fadeIn 0.15s ease' }}>
      <div className="flex gap-2.5 flex-wrap justify-end mb-5">
        <button onClick={() => setAiTailorPrefill(null)} className="btn-primary" style={{ background: '#6B5FA3' }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M8 1.5l1.4 3.4L13 6.2l-3.6 1.3L8 11l-1.4-3.5L3 6.2l3.6-1.3L8 1.5Z" fill="white" />
            <path d="M13 10l.7 1.7L15.5 12.4l-1.8.7L13 15l-.7-1.9-1.8-.7 1.8-.7L13 10Z" fill="white" />
          </svg>
          Tailor CV dengan AI
        </button>
        <button onClick={() => setModalApp(null)} className="btn-primary">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 2v11M2 7.5h11" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          Tambah Lamaran
        </button>
      </div>

      {storageError && <div className="mb-5 text-xs rounded-lg px-3 py-2 bg-rejectedBg text-rejected">{storageError}</div>}

      <div className="flex gap-1 bg-surface border border-line rounded-[14px] p-1 mb-6 w-fit overflow-x-auto max-w-full">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`nav-tab whitespace-nowrap ${tab === t.key ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div>
          <StatsGrid applications={applications} />
          <Charts applications={applications} />
          <ApplicationsTable
            applications={applications}
            loaded={loaded}
            onEdit={(a) => setModalApp(a)}
            onDelete={(a) => setDeleteTarget(a)}
            onStatusChange={handleStatusChange}
            onSend={(a) => setSendTarget(a)}
            onAddFirst={() => setModalApp(null)}
          />
        </div>
      )}
      {tab === 'search' && <JobSearch onApplyWithAi={(prefill) => setAiTailorPrefill(prefill)} />}
      {tab === 'profile' && <Profile userId={userId} profile={profile} setProfile={setProfile} showToast={showToast} />}

      <p className="text-center text-xs text-inkSoft mt-6">Data hanya bisa dilihat olehmu.</p>

      {modalApp !== undefined && <ApplicationModal initial={modalApp} onClose={() => setModalApp(undefined)} onSave={handleSaveForm} />}
      {deleteTarget && <ConfirmDeleteModal app={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={confirmDelete} />}
      {interviewTarget && (
        <InterviewScheduleModal
          app={interviewTarget}
          onCancel={() => setInterviewTarget(null)}
          showToast={showToast}
          onSaved={async (payload) => {
            const updated = await updateApplication(interviewTarget.id, payload);
            if (updated) setInterviewTarget(null);
            return updated;
          }}
        />
      )}
      {aiTailorPrefill !== undefined && (
        <AiTailorModal profile={profile} prefill={aiTailorPrefill} onClose={() => setAiTailorPrefill(undefined)} onSaved={createApplication} showToast={showToast} />
      )}
      {sendTarget && (
        <SendEmailModal
          app={sendTarget}
          profile={profile}
          onClose={() => setSendTarget(null)}
          showToast={showToast}
          onSent={(payload) => updateApplication(sendTarget.id, payload)}
        />
      )}
    </div>
  );
}
