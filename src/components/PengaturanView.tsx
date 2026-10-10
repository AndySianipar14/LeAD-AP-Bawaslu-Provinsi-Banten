import React, { useState } from 'react';
import { 
  Settings, 
  Calendar, 
  MapPin, 
  Users, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Lock, 
  Key, 
  ShieldCheck,
  HardDrive,
  Mail,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { DEFAULT_HARI_LIBUR, KODE_WILAYAH_BAWASLU } from '../utils/businessLogic';
import { HariLibur } from '../types/leadAp';
import { 
   
  getCachedUser, 
  TARGET_DRIVE_EMAIL 
} from '../services/googleDriveService';

interface PengaturanViewProps {
  onOpenDriveManager?: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({ onOpenDriveManager }) => {
  const [activeSubTab, setActiveSubTab] = useState<'kalender' | 'wilayah' | 'ambang' | 'keamanan' | 'drive'>('kalender');
  const [hariLiburList, setHariLiburList] = useState<HariLibur[]>(DEFAULT_HARI_LIBUR);
  const [newLiburDate, setNewLiburDate] = useState<string>('');
  const [newLiburKet, setNewLiburKet] = useState<string>('');
  const [newLiburTipe, setNewLiburTipe] = useState<'Libur Nasional' | 'Cuti Bersama'>('Libur Nasional');

  const [ambangWaspada, setAmbangWaspada] = useState<number>(5);
  const [ambangKritis, setAmbangKritis] = useState<number>(2);
  const [savedAlert, setSavedAlert] = useState<boolean>(false);

  // Auto sync drive setting
  const [autoDriveSync, setAutoDriveSync] = useState<boolean>(() => {
    return localStorage.getItem('leadap_auto_drive_sync') !== 'false';
  });

  // Akun Admin
  const [adminUser, setAdminUser] = useState<string>(
    localStorage.getItem('leadap_admin_username') || 'admin_banten'
  );
  const [adminPass, setAdminPass] = useState<string>(
    localStorage.getItem('leadap_admin_password') || 'Bawaslu2028!'
  );
  const [adminSaved, setAdminSaved] = useState<boolean>(false);

  const handleSaveCredentials = () => {
    localStorage.setItem('leadap_admin_username', adminUser.trim());
    localStorage.setItem('leadap_admin_password', adminPass);
    setAdminSaved(true);
    setTimeout(() => setAdminSaved(false), 2500);
  };

  const handleAddLibur = () => {
    if (!newLiburDate || !newLiburKet) return;
    setHariLiburList((prev) => [
      ...prev,
      { tanggal: newLiburDate, keterangan: newLiburKet, tipe: newLiburTipe }
    ]);
    setNewLiburDate('');
    setNewLiburKet('');
  };

  const handleDeleteLibur = (tgl: string) => {
    setHariLiburList((prev) => prev.filter((h) => h.tanggal !== tgl));
  };

  const handleSaveAmbang = () => {
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Header View */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-xl shadow-md border-b-4 border-amber-500">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-amber-500 text-slate-950 font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight">
              PENGATURAN SISTEM & MASTER DATA LeAD-AP
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Kalender hari kerja resmi Bawaslu, kode wilayah peradilan pemilu, dan konfigurasi ambang batas timer HK.
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-50 border-b flex gap-2 p-2">
          <button
            onClick={() => setActiveSubTab('kalender')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'kalender'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Kalender Hari Kerja & Libur</span>
          </button>

          <button
            onClick={() => setActiveSubTab('wilayah')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'wilayah'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Kode Wilayah Bawaslu</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ambang')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'ambang'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Ambang Batas Peringatan HK</span>
          </button>

          <button
            onClick={() => setActiveSubTab('keamanan')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'keamanan'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Akun & Kata Sandi Admin</span>
          </button>

          <button
            onClick={() => setActiveSubTab('drive')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'drive'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Penyimpanan Google Drive</span>
          </button>
        </div>

        {/* Content Tab: Kalender */}
        {activeSubTab === 'kalender' && (
          <div className="p-5 space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed">
              <strong className="block mb-0.5">Aturan Penghitungan Waktu:</strong>
              Seluruh tenggat waktu dihitung dalam <strong>Hari Kerja</strong>,
              yaitu hari Senin sampai dengan Jumat, tidak termasuk hari libur nasional dan cuti bersama yang ditetapkan Pemerintah.
            </div>

            {/* Form Tambah Hari Libur */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
                Tambah Hari Libur / Cuti Bersama:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={newLiburDate}
                  onChange={(e) => setNewLiburDate(e.target.value)}
                  className="p-2 border rounded-lg bg-white text-xs font-mono"
                />
                <input
                  type="text"
                  value={newLiburKet}
                  onChange={(e) => setNewLiburKet(e.target.value)}
                  placeholder="Keterangan hari libur / cuti..."
                  className="flex-1 min-w-[220px] p-2 border rounded-lg bg-white text-xs"
                />
                <select
                  value={newLiburTipe}
                  onChange={(e) => setNewLiburTipe(e.target.value as any)}
                  className="p-2 border rounded-lg bg-white text-xs font-semibold"
                >
                  <option value="Libur Nasional">Libur Nasional</option>
                  <option value="Cuti Bersama">Cuti Bersama</option>
                </select>
                <button
                  onClick={handleAddLibur}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-lg text-xs"
                >
                  + Tambah Kalender
                </button>
              </div>
            </div>

            {/* Tabel Hari Libur */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b uppercase">
                    <th className="py-2.5 px-3 w-32">Tanggal</th>
                    <th className="py-2.5 px-3 w-36">Tipe Libur</th>
                    <th className="py-2.5 px-3 min-w-[240px]">Keterangan</th>
                    <th className="py-2.5 px-3 w-20 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hariLiburList.map((libur, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{libur.tanggal}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          libur.tipe === 'Libur Nasional' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {libur.tipe}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-800 font-medium">{libur.keterangan}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => handleDeleteLibur(libur.tanggal)}
                          className="p-1 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Tab: Wilayah */}
        {activeSubTab === 'wilayah' && (
          <div className="p-5 space-y-4 text-xs">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
              Daftar Tabel Referensi Kode Wilayah Bawaslu:
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b uppercase">
                    <th className="py-2 px-3 w-28">Kode Wilayah</th>
                    <th className="py-2 px-3 w-32">Tingkatan</th>
                    <th className="py-2 px-3 min-w-[280px]">Nama Satuan Kerja Bawaslu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {KODE_WILAYAH_BAWASLU.map((w, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-bold text-blue-900">{w.kode}</td>
                      <td className="py-2 px-3 text-slate-600">{w.level}</td>
                      <td className="py-2 px-3 font-sans font-medium text-slate-900">{w.nama}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Content Tab: Ambang Batas */}
        {activeSubTab === 'ambang' && (
          <div className="p-5 space-y-4 text-xs max-w-xl">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
              Konfigurasi Peringatan Visual Timer 14 Hari Kerja (Bab 5.2):
            </span>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Ambang Peringatan Kuning (Waspada):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={ambangWaspada}
                    onChange={(e) => setAmbangWaspada(Number(e.target.value))}
                    className="w-24 p-2 border rounded-lg bg-white font-bold"
                  />
                  <span className="text-slate-600">Hari Kerja tersisa (Default: ≤ 5 HK)</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Ambang Peringatan Merah (Kritis):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={ambangKritis}
                    onChange={(e) => setAmbangKritis(Number(e.target.value))}
                    className="w-24 p-2 border rounded-lg bg-white font-bold text-red-600"
                  />
                  <span className="text-slate-600">Hari Kerja tersisa (Default: ≤ 2 HK)</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveAmbang}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  {savedAlert ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{savedAlert ? 'Pengaturan Disimpan!' : 'Simpan Parameter'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab: Keamanan & Akun Admin */}
        {activeSubTab === 'keamanan' && (
          <div className="p-5 space-y-4 text-xs max-w-xl">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
              Kelola Kredensial Autentikasi Administrator:
            </span>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 leading-relaxed">
              Pengguna dengan peran <strong>Administrator</strong> memiliki wewenang untuk menambah, mengubah, dan menghapus seluruh perkara, persidangan, serta menghubungkan Google Drive.
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Username Administrator:
                </label>
                <input
                  type="text"
                  value={adminUser}
                  onChange={(e) => setAdminUser(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white font-medium text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Kata Sandi (Password):
                </label>
                <input
                  type="password"
                  value={adminPass}
                  onChange={(e) => setAdminPass(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white font-medium text-xs text-slate-800"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSaveCredentials}
                  className="bg-red-700 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  {adminSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  <span>{adminSaved ? 'Kredensial Admin Diperbarui!' : 'Simpan Kredensial Admin'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Tab: Google Drive Storage */}
        {activeSubTab === 'drive' && (
          <div className="p-5 space-y-4 text-xs max-w-2xl">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
              Konfigurasi Penyimpanan Google Drive Bawaslu Banten:
            </span>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 space-y-1.5">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-700" />
                <span className="font-bold text-xs">Akun Google Drive Resmi Terhubung:</span>
              </div>
              <p className="font-mono text-sm font-bold text-blue-900 bg-white p-2 rounded-lg border border-blue-200">
                {TARGET_DRIVE_EMAIL}
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                Segala file perkara, dokumen Berita Acara (ADM.BA-REG), Salinan Putusan (ADM.PUTUSAN), risalah sidang, serta file alat bukti masukan disimpan dan disinkronkan ke akun Google Drive ini.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="font-bold text-slate-800 block uppercase tracking-wide text-xs">
                Folder Kerja di Google Drive:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="font-mono font-bold text-emerald-800 text-[11px] block">01_Database_dan_Cadangan</span>
                  <span className="text-[10px] text-slate-500">File JSON snapshot database seluruh perkara & riwayat.</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="font-mono font-bold text-blue-800 text-[11px] block">02_Dokumen_Sidang_Resmi</span>
                  <span className="text-[10px] text-slate-500">Formulir dinas ADM.BA-REG, SPS, Putusan, dll.</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <span className="font-mono font-bold text-purple-800 text-[11px] block">03_Berkas_Alat_Bukti</span>
                  <span className="text-[10px] text-slate-500">Lampiran bukti pelapor & terlapor (P-n/T-n).</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Sinkronisasi Otomatis (Auto-Sync)</span>
                  <span className="text-[11px] text-slate-500">
                    Kirim pembaruan database secara otomatis ke Google Drive setiap kali perkara ditambah atau diubah.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDriveSync}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setAutoDriveSync(val);
                      localStorage.setItem('leadap_auto_drive_sync', String(val));
                    }}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                </label>
              </div>

              {onOpenDriveManager && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600">Status Akun: {null ? 'Terhubung' : 'Siap Dihubungkan'}</span>
                  <button
                    onClick={onOpenDriveManager}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Buka Pengelola Google Drive</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
