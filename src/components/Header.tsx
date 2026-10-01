import React, { useState, useEffect } from 'react';
import { Shield, Clock, Users, PlusCircle, Zap, Scale, FileText, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types/leadAp';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenNewCaseModal: () => void;
  onOpenAcaraCepatModal: () => void;
  onOpenAiAnalyst: () => void;
}

const ROLE_LABELS: Record<UserRole, { label: string; badge: string; desc: string }> = {
  publik: {
    label: 'Publik (Warga / Pemantau)',
    badge: 'bg-emerald-600 text-white',
    desc: 'Akses keterbukaan informasi peradilan (PDP aktif)'
  },
  petugas_registrasi: {
    label: 'Petugas Registrasi',
    badge: 'bg-blue-600 text-white',
    desc: 'Penerimaan, verifikasi syarat, penerbitan ADM.BA-REG'
  },
  sekretaris: {
    label: 'Sekretaris Pemeriksa',
    badge: 'bg-amber-600 text-white',
    desc: 'Penjadwalan, ADM.SPS, ADM.BA-SP, ceklis alat bukti'
  },
  perisalah: {
    label: 'Perisalah Sidang',
    badge: 'bg-teal-600 text-white',
    desc: 'Penyusunan Risalah Sidang (ADM.RISALAH)'
  },
  asisten: {
    label: 'Asisten Pemeriksa',
    badge: 'bg-purple-600 text-white',
    desc: 'Kajian yuridis, ringkasan bukti, draf putusan'
  },
  majelis: {
    label: 'Majelis / Ketua Bawaslu',
    badge: 'bg-red-700 text-white',
    desc: 'Pimpinan sidang, pengesahan bukti, rapat pleno, amar putusan'
  },
  admin: {
    label: 'Administrator Sistem',
    badge: 'bg-slate-800 text-white',
    desc: 'Master kalender kerja, kode wilayah, hak akses'
  }
};

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  onOpenNewCaseModal,
  onOpenAcaraCepatModal,
  onOpenAiAnalyst
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      };
      setCurrentTime(now.toLocaleDateString('id-ID', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 border-b-4 border-amber-600 text-white shadow-xl sticky top-0 z-40">
      {/* Top Bar with Live Info & Role Switcher */}
      <div className="bg-slate-950/80 px-4 py-1.5 text-xs border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-3 text-slate-300">
          <span className="flex items-center gap-1 font-mono text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            {currentTime || 'Memuat waktu...'}
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline text-slate-400 font-medium">
            Rujukan: Peraturan Bawaslu Nomor 8 Tahun 2022
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 text-xs hidden sm:inline">Peran Pengguna:</span>
            <select
              aria-label="Pilih Peran Pengguna"
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value as UserRole)}
              className="bg-slate-800 text-white border border-slate-700 rounded px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {Object.entries(ROLE_LABELS).map(([roleKey, info]) => (
                <option key={roleKey} value={roleKey}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>

          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${ROLE_LABELS[currentRole].badge}`}>
            {currentRole === 'publik' ? 'PORTAL PUBLIK' : 'RUANG KERJA INTERNAL'}
          </span>
        </div>
      </div>

      {/* Main Brand & Action Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-red-700 flex items-center justify-center shadow-lg border border-amber-400/40 shrink-0">
            <Scale className="w-7 h-7 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <span className="text-amber-400 font-serif">LeAD-AP</span>
              </h1>
            </div>
            <p className="text-xs md:text-sm font-medium text-slate-300">
              Layanan e-Administrasi (Sidang) Administratif Pemilu
            </p>
            <p className="text-[11px] text-amber-300/90 font-mono hidden sm:block">
              Sistem Penelusuran Perkara Penyelesaian Pelanggaran Administratif Pemilu — Bawaslu Provinsi Banten
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end">
          {/* AI Legal Analyst Button with High Thinking */}
          <button
            onClick={onOpenAiAnalyst}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-md hover:shadow-indigo-500/20 transition-all border border-purple-400/30"
            title="Analisis yuridis mendalam berbasis Gemini 3.1 Pro dengan Penalaran Tingkat Tinggi"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Scale className="w-3.5 h-3.5" />
            <span>Asisten Yuridis AI (Thinking)</span>
          </button>

          {/* Acara Cepat button (Pasal 40-43, instant 1-screen mobile form) */}
          <button
            onClick={onOpenAcaraCepatModal}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-3 py-2 rounded-lg shadow-md hover:shadow-amber-500/20 transition-all"
            title="Formulir satu layar pemeriksaan acara cepat di lapangan (Pasal 40-43)"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Acara Cepat Lapangan</span>
          </button>

          {/* Registrasi Perkara Baru (only for staff/admin) */}
          {currentRole !== 'publik' && (
            <button
              onClick={onOpenNewCaseModal}
              className="flex items-center gap-1.5 bg-red-700 hover:bg-red-600 text-white font-semibold text-xs px-3 py-2 rounded-lg shadow-md hover:shadow-red-600/20 transition-all border border-red-500/40"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Registrasi Perkara Baru</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
