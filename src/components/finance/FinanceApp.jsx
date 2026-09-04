import { useState } from 'react';
import { useFinance } from '../../hooks/useFinance';
import AccountsTable from './AccountsTable';
import AccountModal from './AccountModal';
import ExpensesList from './ExpensesList';
import ExpenseModal from './ExpenseModal';
import FinanceCharts from './FinanceCharts';
import TargetsList, { TargetModal } from './TargetsList';
import ConfirmModal from './ConfirmModal';

const TABS = [
  { key: 'summary', label: 'Ringkasan' },
  { key: 'accounts', label: 'Rekening' },
  { key: 'expenses', label: 'Pengeluaran' },
  { key: 'targets', label: 'Target' },
];

export default function FinanceApp({ userId, showToast }) {
  const {
    accounts,
    expenses,
    targets,
    totalBalance,
    loaded,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    createExpense,
    updateExpense,
    deleteExpense,
    createTarget,
    updateTarget,
    deleteTarget,
  } = useFinance(userId);

  const [tab, setTab] = useState('summary');
  const [accountModal, setAccountModal] = useState(undefined);
  const [expenseModal, setExpenseModal] = useState(undefined);
  const [targetModal, setTargetModal] = useState(undefined);
  const [confirmDelete, setConfirmDelete] = useState(null); // { type, item }

  const saveAccount = async (form) => {
    const result = form.id ? await updateAccount(form.id, form) : await createAccount(form);
    if (result) {
      showToast(form.id ? 'updated' : 'added', form.id ? 'Rekening diperbarui' : 'Rekening ditambahkan', form.bank_name);
      setAccountModal(undefined);
    }
  };
  const saveExpense = async (form) => {
    const result = form.id ? await updateExpense(form.id, form) : await createExpense(form);
    if (result) {
      showToast(form.id ? 'updated' : 'added', form.id ? 'Pengeluaran diperbarui' : 'Pengeluaran dicatat', form.category);
      setExpenseModal(undefined);
    }
  };
  const saveTarget = async (form) => {
    const result = form.id ? await updateTarget(form.id, form) : await createTarget(form);
    if (result) {
      showToast(form.id ? 'updated' : 'added', form.id ? 'Target diperbarui' : 'Target ditambahkan', form.name);
      setTargetModal(undefined);
    }
  };

  const handleConfirmDelete = async () => {
    const { type, item } = confirmDelete;
    let ok = false;
    if (type === 'account') ok = await deleteAccount(item.id);
    if (type === 'expense') ok = await deleteExpense(item.id);
    if (type === 'target') ok = await deleteTarget(item.id);
    if (ok) {
      showToast('deleted', 'Berhasil dihapus');
      setConfirmDelete(null);
    }
  };

  if (!loaded) return <div className="py-16 text-center text-sm text-inkSoft">Memuat data keuangan...</div>;

  return (
    <div className="app-section" style={{ animation: 'fadeIn 0.15s ease' }}>
      {error && <div className="mb-5 text-xs rounded-lg px-3 py-2 bg-rejectedBg text-rejected">{error}</div>}

      <div className="flex gap-1 bg-surface border border-line rounded-[14px] p-1 mb-6 w-fit overflow-x-auto max-w-full">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`nav-tab whitespace-nowrap ${tab === t.key ? 'active' : ''}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <div>
          <FinanceCharts expenses={expenses} />
          <div className="mt-3.5">
            <AccountsTable accounts={accounts} totalBalance={totalBalance} onAdd={() => setAccountModal(null)} onEdit={(a) => setAccountModal(a)} onDelete={(a) => setConfirmDelete({ type: 'account', item: a })} showToast={showToast} />
          </div>
        </div>
      )}

      {tab === 'accounts' && (
        <AccountsTable accounts={accounts} totalBalance={totalBalance} onAdd={() => setAccountModal(null)} onEdit={(a) => setAccountModal(a)} onDelete={(a) => setConfirmDelete({ type: 'account', item: a })} showToast={showToast} />
      )}

      {tab === 'expenses' && (
        <ExpensesList expenses={expenses} accounts={accounts} onAdd={() => setExpenseModal(null)} onEdit={(e) => setExpenseModal(e)} onDelete={(e) => setConfirmDelete({ type: 'expense', item: e })} />
      )}

      {tab === 'targets' && (
        <TargetsList targets={targets} totalBalance={totalBalance} onAdd={() => setTargetModal(null)} onEdit={(t) => setTargetModal(t)} onDelete={(t) => setConfirmDelete({ type: 'target', item: t })} />
      )}

      {accountModal !== undefined && <AccountModal initial={accountModal} onClose={() => setAccountModal(undefined)} onSave={saveAccount} />}
      {expenseModal !== undefined && <ExpenseModal initial={expenseModal} accounts={accounts} onClose={() => setExpenseModal(undefined)} onSave={saveExpense} />}
      {targetModal !== undefined && <TargetModal initial={targetModal} onClose={() => setTargetModal(undefined)} onSave={saveTarget} />}
      {confirmDelete && (
        <ConfirmModal
          title={confirmDelete.type === 'account' ? 'Hapus rekening ini?' : confirmDelete.type === 'expense' ? 'Hapus catatan pengeluaran ini?' : 'Hapus target ini?'}
          description={
            confirmDelete.type === 'account'
              ? `Rekening ${confirmDelete.item.bank_name} akan dihapus permanen.`
              : confirmDelete.type === 'expense'
              ? `Pengeluaran kategori ${confirmDelete.item.category} akan dihapus permanen.`
              : `Target ${confirmDelete.item.name} akan dihapus permanen.`
          }
          onCancel={() => setConfirmDelete(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
