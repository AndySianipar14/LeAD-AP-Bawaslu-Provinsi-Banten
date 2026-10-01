/**
 * LeAD-AP (Layanan e-Administrasi Sidang Administratif Pemilu)
 * Sistem Penelusuran Perkara Penyelesaian Pelanggaran Administratif Pemilu model SIPP
 * Badan Pengawas Pemilihan Umum Republik Indonesia (2026)
 * Rujukan: Perbawaslu Nomor 8 Tahun 2022 & Draft Panduan Sidang Administratif Pemilu
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation, ActiveTab } from './components/Navigation';
import { SummaryCards } from './components/SummaryCards';
import { PerkaraTable } from './components/PerkaraTable';
import { PerkaraDetail } from './components/PerkaraDetail';
import { RuangKerja } from './components/RuangKerja';
import { JadwalSidangView } from './components/JadwalSidangView';
import { StatistikView } from './components/StatistikView';
import { PengaturanView } from './components/PengaturanView';
import { AlurSidangSimulator } from './components/AlurSidangSimulator';
import { FormulirGeneratorModal } from './components/FormulirGeneratorModal';
import { AcaraCepatModal } from './components/AcaraCepatModal';
import { RegistrasiPerkaraModal } from './components/RegistrasiPerkaraModal';
import { KoreksiModal } from './components/KoreksiModal';
import { AiLegalAnalyst } from './components/AiLegalAnalyst';

import { Perkara, TaskItem, UserRole } from './types/leadAp';
import { INITIAL_PERKARA_DATA, INITIAL_TASKS } from './data/mockData';
import { Scale, ShieldCheck, DownloadCloud, FileText, Gavel, AlertOctagon } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('publik');
  const [activeTab, setActiveTab] = useState<ActiveTab>('beranda');
  const [perkaraList, setPerkaraList] = useState<Perkara[]>(INITIAL_PERKARA_DATA);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [selectedPerkara, setSelectedPerkara] = useState<Perkara | null>(null);
  const [summaryFilter, setSummaryFilter] = useState<string | null>(null);

  // Modals state
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState<boolean>(false);
  const [isAcaraCepatModalOpen, setIsAcaraCepatModalOpen] = useState<boolean>(false);
  const [isAiAnalystOpen, setIsAiAnalystOpen] = useState<boolean>(false);
  const [aiTargetPerkara, setAiTargetPerkara] = useState<Perkara | null>(null);

  const [sidangSimulatorPerkara, setSidangSimulatorPerkara] = useState<Perkara | null>(null);
  const [formGeneratorPerkara, setFormGeneratorPerkara] = useState<Perkara | null>(null);
  const [formGeneratorKode, setFormGeneratorKode] = useState<string>('ADM.BA-REG');
  const [koreksiPerkara, setKoreksiPerkara] = useState<Perkara | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers
  const handleSaveNewPerkara = (newPerkara: Perkara) => {
    setPerkaraList((prev) => [newPerkara, ...prev]);
    // Buat task otomatis untuk Ketua Bawaslu: Tetapkan Majelis
    const newTask: TaskItem = {
      id: 'task-' + Date.now(),
      perkara_id: newPerkara.id,
      nomor_register: newPerkara.nomor_register,
      judul: 'Tetapkan Majelis Pemeriksa (Pasal 13)',
      deskripsi: `Perkara baru ${newPerkara.nomor_register} telah diregistrasi. Ketua Bawaslu segera tetapkan susunan Majelis dan tim pendukung.`,
      target_role: 'majelis',
      tenggat_waktu: newPerkara.tgl_registrasi,
      prioritas: 'Kritis',
      status_tugas: 'Menunggu',
      action_type: 'tetapkan_majelis'
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Perkara ${newPerkara.nomor_register} berhasil diregistrasi! Timer 14 HK dimulai.`);
  };

  const handleSaveAcaraCepat = (acaraCepatCase: Perkara) => {
    setPerkaraList((prev) => [acaraCepatCase, ...prev]);
    showToast(`Putusan Acara Cepat ${acaraCepatCase.nomor_register} seketika diterbitkan di hari yang sama!`);
  };

  const handleUpdatePerkara = (updated: Perkara) => {
    setPerkaraList((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    if (selectedPerkara?.id === updated.id) {
      setSelectedPerkara(updated);
    }
  };

  const handleSidangResult = (updated: Perkara, summaryMsg: string) => {
    handleUpdatePerkara(updated);
    showToast(summaryMsg);
  };

  const handleCompleteTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status_tugas: 'Selesai' } : t))
    );
    showToast('Tugas berhasil ditandai selesai.');
  };

  const openAiForCase = (perkara?: Perkara | null) => {
    setAiTargetPerkara(perkara || null);
    setIsAiAnalystOpen(true);
  };

  const openFormForCase = (perkara?: Perkara | null, kode: string = 'ADM.BA-REG') => {
    setFormGeneratorPerkara(perkara || null);
    setFormGeneratorKode(kode);
  };

  // Filtered case lists based on tab
  const displayedCases = (() => {
    if (activeTab === 'pelanggaran_biasa') {
      return perkaraList.filter((p) => p.jalur === 'biasa');
    }
    if (activeTab === 'tsm') {
      return perkaraList.filter((p) => p.jalur === 'tsm');
    }
    if (activeTab === 'acara_cepat') {
      return perkaraList.filter((p) => p.jalur === 'acara_cepat');
    }
    if (activeTab === 'koreksi') {
      return perkaraList.filter((p) => p.status === 'S11' || Boolean(p.koreksi));
    }
    if (activeTab === 'putusan') {
      return perkaraList.filter((p) => Boolean(p.putusan));
    }
    return perkaraList;
  })();

  const pendingTasksCount = tasks.filter(
    (t) => t.status_tugas === 'Menunggu' && (currentRole === 'admin' || t.target_role === currentRole)
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-amber-200 selection:text-slate-900">
      {/* Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={(r) => {
          setCurrentRole(r);
          showToast(`Beralih ke peran: ${r.replace('_', ' ').toUpperCase()}`);
        }}
        onOpenNewCaseModal={() => setIsNewCaseModalOpen(true)}
        onOpenAcaraCepatModal={() => setIsAcaraCepatModalOpen(true)}
        onOpenAiAnalyst={() => openAiForCase(selectedPerkara)}
      />

      {/* Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          setSelectedPerkara(null);
          setActiveTab(tab);
        }}
        currentRole={currentRole}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 space-y-5">
        {/* Toast Floating Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-amber-300 border border-amber-500/60 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-bounce">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Condition 1: Detailed Case View */}
        {selectedPerkara ? (
          <PerkaraDetail
            perkara={selectedPerkara}
            onBack={() => setSelectedPerkara(null)}
            currentRole={currentRole}
            onOpenSidangSimulator={(p) => setSidangSimulatorPerkara(p)}
            onOpenFormGenerator={(p, kode) => openFormForCase(p, kode)}
            onOpenAiAnalyst={(p) => openAiForCase(p)}
            onUpdatePerkara={handleUpdatePerkara}
            onOpenKoreksiModal={(p) => setKoreksiPerkara(p)}
          />
        ) : (
          /* Condition 2: Tab Views */
          <>
            {/* View: Jadwal Sidang */}
            {activeTab === 'jadwal_sidang' && (
              <JadwalSidangView
                perkaraList={perkaraList}
                onSelectPerkara={(p) => setSelectedPerkara(p)}
                onOpenSidangSimulator={(p) => setSidangSimulatorPerkara(p)}
              />
            )}

            {/* View: Ruang Kerja */}
            {activeTab === 'ruang_kerja' && (
              <RuangKerja
                tasks={tasks}
                perkaraList={perkaraList}
                currentRole={currentRole}
                onSelectPerkara={(p) => setSelectedPerkara(p)}
                onOpenSidangSimulator={(p) => setSidangSimulatorPerkara(p)}
                onOpenFormGenerator={(p, kode) => openFormForCase(p, kode)}
                onCompleteTask={handleCompleteTask}
              />
            )}

            {/* View: Statistik */}
            {activeTab === 'statistik' && <StatistikView perkaraList={perkaraList} />}

            {/* View: Pengaturan */}
            {activeTab === 'pengaturan' && <PengaturanView />}

            {/* View: Unduh Formulir Direct Modal View */}
            {activeTab === 'unduh_formulir' && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <DownloadCloud className="w-5 h-5 text-amber-600" />
                      <span>DIREKTORI 18 FORMULIR RESMI PERBAWASLU 8/2022</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Templat format resmi tata naskah dinas persidangan pelanggaran administratif Pemilu.
                    </p>
                  </div>
                  <button
                    onClick={() => openFormForCase(null, 'ADM.BA-REG')}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Buka Editor & Generator Dokumen</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { kode: 'ADM.NRL', nama: 'Format Penomoran Register', kat: 'Registrasi' },
                    { kode: 'ADM.BA-REG', nama: 'Berita Acara Registrasi Laporan/Temuan', kat: 'Registrasi' },
                    { kode: 'ADM.SPS', nama: 'Surat Panggilan & Pemberitahuan Sidang', kat: 'Panggilan' },
                    { kode: 'ADM.JAWABAN', nama: 'Dokumen Jawaban Terlapor (3 Rangkap)', kat: 'Sidang' },
                    { kode: 'ADM.BA-SP', nama: 'Berita Acara Sidang Pemeriksaan', kat: 'Sidang' },
                    { kode: 'ADM.RISALAH', nama: 'Risalah Sidang Lengkap Per Sesi', kat: 'Sidang' },
                    { kode: 'ADM.BA-SUMPAH', nama: 'BA Sumpah/Janji Saksi & Ahli', kat: 'Pembuktian' },
                    { kode: 'ADM.BA-PST', nama: 'BA Pemeriksaan Setempat Lapangan', kat: 'Pembuktian' },
                    { kode: 'ADM.PUTUSAN', nama: 'Salinan Putusan Sidang Terbuka', kat: 'Putusan' },
                    { kode: 'ADM.STATUS', nama: 'Publikasi Status di Laman Resmi', kat: 'Publikasi' },
                    { kode: 'ADM.KOREKSI', nama: 'Permintaan Koreksi Putusan', kat: 'Koreksi' },
                    { kode: 'ADM.TT-KOREKSI', nama: 'Tanda Terima Permintaan Koreksi', kat: 'Koreksi' },
                    { kode: 'ADM.BA-REG.KOREKSI', nama: 'BA Registrasi Permohonan Koreksi', kat: 'Koreksi' },
                    { kode: 'ADM.SP-KOREKSI', nama: 'Pemberitahuan Koreksi Pihak Lawan', kat: 'Koreksi' },
                    { kode: 'ADM.JAWABAN-KOREKSI', nama: 'Jawaban atas Permintaan Koreksi', kat: 'Koreksi' },
                    { kode: 'ADM.PUTUSAN-KOREKSI', nama: 'Putusan Koreksi Bawaslu RI', kat: 'Koreksi' },
                    { kode: 'ADM.STL-KOREKSI', nama: 'Status Permintaan Koreksi di Laman', kat: 'Koreksi' },
                    { kode: 'ADM.ACARA CEPAT', nama: 'Putusan Pemeriksaan Acara Cepat', kat: 'Acara Cepat' }
                  ].map((f) => (
                    <div
                      key={f.kode}
                      onClick={() => openFormForCase(null, f.kode)}
                      className="p-3 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 cursor-pointer transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-900 text-xs">{f.kode}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {f.kat}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">
                        {f.nama}
                      </span>
                      <span className="text-[11px] text-amber-700 font-bold mt-2 flex items-center gap-1">
                        <span>Buka Templat Formulir</span>
                        <span>→</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Default Case Tables (Beranda, Pelanggaran Biasa, TSM, Acara Cepat, Koreksi, Putusan) */}
            {(activeTab === 'beranda' ||
              activeTab === 'pelanggaran_biasa' ||
              activeTab === 'tsm' ||
              activeTab === 'acara_cepat' ||
              activeTab === 'koreksi' ||
              activeTab === 'putusan') && (
              <>
                {/* Specific Announcement Banner per tab */}
                {activeTab === 'tsm' && (
                  <div className="bg-rose-900 text-white p-3.5 rounded-xl shadow-xs flex items-center gap-3 text-xs border border-rose-700">
                    <AlertOctagon className="w-5 h-5 text-amber-300 shrink-0" />
                    <div>
                      <strong className="block text-amber-200">
                        JALUR PELANGGARAN ADMINISTRATIF TSM (PASAL 55–71 PERBAWASLU 8/2022)
                      </strong>
                      Diperiksa oleh Bawaslu RI dengan Majelis minimal 3 orang. Khusus mengenai dugaan perbuatan Terstruktur, Sistematis, dan Masif dengan sanksi pembatalan Calon / Paslon (Pasal 69).
                    </div>
                  </div>
                )}

                {activeTab === 'acara_cepat' && (
                  <div className="bg-amber-600 text-slate-950 p-3.5 rounded-xl shadow-xs flex items-center justify-between gap-3 text-xs font-semibold">
                    <div>
                      <strong className="block text-slate-950 text-sm">
                        JALUR PEMERIKSAAN ACARA CEPAT LAPANGAN (PASAL 40–43)
                      </strong>
                      Diputus di hari yang sama di tempat kejadian oleh Pengawas Pemilu. Mengesampingkan ketentuan sidang Pasal 13–35.
                    </div>
                    <button
                      onClick={() => setIsAcaraCepatModalOpen(true)}
                      className="bg-slate-950 hover:bg-slate-900 text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0"
                    >
                      + Isi Formulir Lapangan
                    </button>
                  </div>
                )}

                {activeTab === 'koreksi' && (
                  <div className="bg-blue-900 text-white p-3.5 rounded-xl shadow-xs flex items-center gap-3 text-xs border border-blue-700">
                    <Gavel className="w-5 h-5 text-amber-300 shrink-0" />
                    <div>
                      <strong className="block text-amber-200">
                        ALUR PERMINTAAN KOREKSI PUTUSAN KE BAWASLU RI (PASAL 44–54)
                      </strong>
                      Hanya atas putusan Bawaslu Provinsi/Kab/Kota (non acara cepat) dengan tenggat pengajuan ≤ 3 HK. Pelaksanaan putusan DITUNDA selama proses koreksi (Pasal 54).
                    </div>
                  </div>
                )}

                {/* 5 KPI Metric Summary Cards */}
                <SummaryCards
                  perkaraList={perkaraList}
                  activeFilter={summaryFilter}
                  onFilterCardClick={(f) => setSummaryFilter(f)}
                />

                {/* Main Table */}
                <PerkaraTable
                  perkaraList={displayedCases}
                  onSelectPerkara={(p) => setSelectedPerkara(p)}
                  currentRole={currentRole}
                  filterPreset={summaryFilter}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-white py-6 mt-12 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-700 text-white font-serif font-black">
              BAWASLU
            </div>
            <div>
              <p className="font-bold text-slate-200">
                Badan Pengawas Pemilihan Umum Provinsi Banten
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                LeAD-AP Versi 1.0 — Sistem Penelusuran Perkara Sidang Administratif Pemilu (Model SIPP)
              </p>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-400 space-y-0.5">
            <p>Rujukan Utama: Peraturan Bawaslu Nomor 8 Tahun 2022 & Panduan Sidang Administratif</p>
            <p className="text-amber-400/90 font-mono">
              Prinsip: Cepat, Tidak Memihak, Tanpa Biaya, dan Terbuka (Pasal 3)
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isNewCaseModalOpen && (
        <RegistrasiPerkaraModal
          onClose={() => setIsNewCaseModalOpen(false)}
          onSavePerkara={handleSaveNewPerkara}
        />
      )}

      {isAcaraCepatModalOpen && (
        <AcaraCepatModal
          onClose={() => setIsAcaraCepatModalOpen(false)}
          onSaveAcaraCepat={handleSaveAcaraCepat}
        />
      )}

      {isAiAnalystOpen && (
        <AiLegalAnalyst
          selectedPerkara={aiTargetPerkara || selectedPerkara}
          perkaraList={perkaraList}
          onClose={() => {
            setIsAiAnalystOpen(false);
            setAiTargetPerkara(null);
          }}
        />
      )}

      {sidangSimulatorPerkara && (
        <AlurSidangSimulator
          perkara={sidangSimulatorPerkara}
          onClose={() => setSidangSimulatorPerkara(null)}
          onSaveSidangResult={handleSidangResult}
          onOpenAiAnalyst={(p) => openAiForCase(p)}
        />
      )}

      {formGeneratorPerkara !== undefined && formGeneratorKode && (
        formGeneratorPerkara !== null ? (
          <FormulirGeneratorModal
            perkara={formGeneratorPerkara}
            initialKode={formGeneratorKode}
            onClose={() => {
              setFormGeneratorPerkara(null);
              setFormGeneratorKode('');
            }}
          />
        ) : (
          activeTab === 'unduh_formulir' && formGeneratorKode ? (
            <FormulirGeneratorModal
              perkara={null}
              initialKode={formGeneratorKode}
              onClose={() => setFormGeneratorKode('')}
            />
          ) : null
        )
      )}

      {koreksiPerkara && (
        <KoreksiModal
          perkara={koreksiPerkara}
          onClose={() => setKoreksiPerkara(null)}
          onSaveKoreksi={handleUpdatePerkara}
        />
      )}
    </div>
  );
}
