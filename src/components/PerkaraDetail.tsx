import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Scale, 
  Calendar, 
  Layers, 
  Users, 
  Gavel, 
  GitPullRequestDraft, 
  History, 
  Printer, 
  Download, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  Sparkles,
  Clock,
  Plus
} from 'lucide-react';
import { Perkara, UserRole, JadwalSidang, AlatBukti, KeteranganSaksiAhli } from '../types/leadAp';
import { STATUS_PERKARA_MAP, getStatusTenggatHK } from '../utils/businessLogic';

interface PerkaraDetailProps {
  perkara: Perkara;
  onBack: () => void;
  currentRole: UserRole;
  onOpenSidangSimulator: (perkara: Perkara) => void;
  onOpenFormGenerator: (perkara: Perkara, formKode?: string) => void;
  onOpenAiAnalyst: (perkara: Perkara) => void;
  onUpdatePerkara: (updated: Perkara) => void;
  onOpenKoreksiModal: (perkara: Perkara) => void;
}

export const PerkaraDetail: React.FC<PerkaraDetailProps> = ({
  perkara,
  onBack,
  currentRole,
  onOpenSidangSimulator,
  onOpenFormGenerator,
  onOpenAiAnalyst,
  onUpdatePerkara,
  onOpenKoreksiModal
}) => {
  const [activeTab, setActiveTab] = useState<
    'data_umum' | 'penetapan' | 'jadwal_sidang' | 'alat_bukti' | 'saksi_ahli' | 'putusan' | 'koreksi' | 'riwayat'
  >('data_umum');

  const statusMeta = STATUS_PERKARA_MAP[perkara.status] || {
    kode: perkara.status,
    nama: perkara.status,
    badgeColor: 'bg-slate-100 text-slate-800',
    badgeBorder: 'border-slate-300'
  };

  const tenggatInfo = getStatusTenggatHK(perkara.lama_proses_hk);
  const isInternal = currentRole !== 'publik';

  // Evaluasi kecukupan bukti sah (Pasal 36 ayat 2)
  const buktiSahCount = (perkara.alat_bukti || []).filter((b) => Boolean(b.tgl_disahkan)).length;
  const isBuktiCukup = buktiSahCount >= 2;

  // Syarat pengajuan koreksi (Pasal 45):
  // 1. Putusan Bawaslu Prov/Kab/Kota (bukan Bawaslu RI)
  // 2. Bukan acara cepat
  // 3. Status S09 atau S10 (dalam masa <= 3 HK sejak dibacakan)
  const canAjukanKoreksi =
    perkara.tingkatan !== 'BWSL' &&
    perkara.jalur !== 'acara_cepat' &&
    (perkara.status === 'S09' || perkara.status === 'S10') &&
    !perkara.koreksi;

  return (
    <div className="space-y-4">
      {/* Top Navigation Bar & Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-amber-800 bg-slate-100 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-slate-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Daftar Perkara</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Legal Analysis for this specific case */}
          <button
            onClick={() => onOpenAiAnalyst(perkara)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 px-3 py-1.5 rounded-lg shadow-sm border border-purple-400/40"
            title="Analisis yuridis fakta persidangan, kecukupan bukti, dan rekomendasi amar putusan dengan AI Thinking"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Analisis Yuridis AI</span>
          </button>

          {/* Jalankan Sidang Simulator jika internal */}
          {isInternal && (
            <button
              onClick={() => onOpenSidangSimulator(perkara)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded-lg shadow-sm border border-red-800"
              title="Simulator Persidangan Pemeriksaan Sesuai Panduan Sidang & Perbawaslu 8/2022"
            >
              <Gavel className="w-3.5 h-3.5" />
              <span>Buka Ruang Sidang</span>
            </button>
          )}

          {/* Buka Generator Formulir */}
          <button
            onClick={() => onOpenFormGenerator(perkara)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Formulir ADM</span>
          </button>

          {/* Ajukan Koreksi jika status putusan Prov/Kab/Kota */}
          {canAjukanKoreksi && (
            <button
              onClick={() => onOpenKoreksiModal(perkara)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-sm"
            >
              <GitPullRequestDraft className="w-3.5 h-3.5" />
              <span>Ajukan Koreksi (≤ 3 HK)</span>
            </button>
          )}
        </div>
      </div>

      {/* Ringkasan Satu Baris (Matching Bab 6.3 Gambar 2) */}
      <div className="bg-slate-900 text-white rounded-xl shadow-md border-b-2 border-amber-500 overflow-hidden">
        <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            INFORMASI DETAIL PERKARA
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {perkara.nama_wilayah}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-800 p-3 text-xs">
          <div className="p-2">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Nomor Register
            </span>
            <span className="font-mono font-bold text-amber-300 text-xs sm:text-sm">
              {perkara.nomor_register}
            </span>
          </div>

          <div className="p-2">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Pelapor / Penemu
            </span>
            <span className="font-semibold text-slate-200">
              {currentRole === 'publik' && perkara.pelapor.flag_disamarkan
                ? 'Disamarkan'
                : perkara.pelapor.nama}
            </span>
          </div>

          <div className="p-2">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Terlapor
            </span>
            <span className="font-semibold text-slate-200">
              {perkara.terlapor.nama}
            </span>
          </div>

          <div className="p-2">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Status Perkara
            </span>
            <div className="mt-0.5">
              <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${statusMeta.badgeColor}`}>
                {statusMeta.kode} • {statusMeta.nama}
              </span>
            </div>
          </div>

          <div className="p-2">
            <span className="text-[10px] text-slate-400 uppercase font-medium block">
              Batas Putusan (14 HK)
            </span>
            <span className="font-mono font-bold text-slate-100 block">
              {perkara.batas_putusan}
            </span>
            <span className={`text-[10px] font-semibold mt-0.5 inline-block ${tenggatInfo.badgeClass} px-1.5 rounded`}>
              {perkara.lama_proses_hk}/14 HK ({tenggatInfo.label})
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Menu (Bab 6.3) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 flex items-center overflow-x-auto no-scrollbar">
          {[
            { id: 'data_umum', label: 'Data Umum', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'penetapan', label: 'Penetapan', icon: <Scale className="w-3.5 h-3.5" /> },
            { id: 'jadwal_sidang', label: 'Jadwal Sidang', icon: <Calendar className="w-3.5 h-3.5" />, badge: perkara.jadwal_sidang?.length },
            { id: 'alat_bukti', label: 'Alat Bukti', icon: <Layers className="w-3.5 h-3.5" />, badge: perkara.alat_bukti?.length },
            { id: 'saksi_ahli', label: 'Saksi/Ahli/Terkait', icon: <Users className="w-3.5 h-3.5" />, badge: perkara.keterangan?.length },
            { id: 'putusan', label: 'Putusan', icon: <Gavel className="w-3.5 h-3.5" /> },
            { id: 'koreksi', label: 'Koreksi', icon: <GitPullRequestDraft className="w-3.5 h-3.5" />, highlight: Boolean(perkara.koreksi) },
            { id: 'riwayat', label: 'Riwayat Perkara', icon: <History className="w-3.5 h-3.5" /> }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-amber-600 text-amber-900 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-slate-200 text-slate-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {tab.badge}
                  </span>
                )}
                {tab.highlight && (
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Data Umum */}
        {activeTab === 'data_umum' && (
          <div className="p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-700" />
              <span>Data Pokok Perkara Sidang Administratif</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500 w-44">Tanggal Registrasi</td>
                    <td className="py-2.5 font-mono font-medium text-slate-900">
                      {perkara.tgl_registrasi} (Mulai hitung 14 HK)
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Nomor Register Resmi</td>
                    <td className="py-2.5 font-mono font-bold text-blue-900">
                      {perkara.nomor_register}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Sumber Perkara</td>
                    <td className="py-2.5 text-slate-900">
                      <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-800 border">
                        {perkara.sumber === 'TM' ? 'Temuan Pengawas Pemilu' : 'Laporan Masyarakat'}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Jenis Perkara / Tahapan</td>
                    <td className="py-2.5 text-slate-900 font-medium">
                      {perkara.kode_jenis} — {perkara.tahapan_pemilu}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Mode Persidangan</td>
                    <td className="py-2.5 text-slate-900">
                      <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                        perkara.mode_sidang === 'Luring' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        Sidang {perkara.mode_sidang}
                      </span>
                      {perkara.alasan_daring && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">
                          Alasan: {perkara.alasan_daring} (Pasal 35)
                        </p>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>

              <table className="w-full text-xs">
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500 w-44">
                      {perkara.sumber === 'TM' ? 'Penemu' : 'Pelapor'}
                    </td>
                    <td className="py-2.5 text-slate-900 font-semibold">
                      {currentRole === 'publik' && perkara.pelapor.flag_disamarkan ? (
                        <span className="italic text-slate-500">
                          Disamarkan (WNI yang mempunyai hak pilih)
                        </span>
                      ) : (
                        <span>{perkara.pelapor.nama} ({perkara.pelapor.jenis})</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Kuasa Hukum Pelapor</td>
                    <td className="py-2.5 text-slate-900">
                      {perkara.kuasa_pelapor ? (
                        <div>
                          <span className="font-medium">{perkara.kuasa_pelapor.nama}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {perkara.kuasa_pelapor.dasar_kuasa}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Tidak menggunakan kuasa</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Terlapor</td>
                    <td className="py-2.5 text-slate-900 font-semibold">
                      {perkara.terlapor.nama} ({perkara.terlapor.jenis})
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Kuasa Hukum Terlapor</td>
                    <td className="py-2.5 text-slate-900">
                      {perkara.kuasa_terlapor ? (
                        <span className="font-medium">{perkara.kuasa_terlapor.nama}</span>
                      ) : (
                        <span className="text-slate-400 italic">Tidak ada / Mandiri</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 font-semibold text-slate-500">Publikasi Data Pribadi</td>
                    <td className="py-2.5 text-slate-700">
                      Terlapor: Ya | Pelapor: {perkara.pelapor.flag_disamarkan ? 'Disamarkan (Publik)' : 'Terbuka'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pokok Laporan & Petitum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Pokok Laporan / Temuan
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {perkara.pokok_laporan}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
                  Hal yang Dimohonkan (Petitum)
                </span>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {perkara.hal_dimohonkan}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Penetapan */}
        {activeTab === 'penetapan' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-700" />
                <span>Penetapan Majelis Pemeriksa & Tim Pendukung Persidangan</span>
              </h3>
              {perkara.penetapan && (
                <span className="text-xs font-mono font-semibold text-slate-600">
                  SK: {perkara.penetapan.nomor_keputusan} ({perkara.penetapan.tanggal_keputusan})
                </span>
              )}
            </div>

            {perkara.penetapan ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-amber-800" />
                    <span>Susunan Majelis Pemeriksa (Pasal 13 & 17)</span>
                  </h4>
                  <div className="text-xs space-y-2">
                    <div>
                      <span className="text-slate-500 font-medium block">Ketua Majelis Pemeriksa:</span>
                      <span className="font-bold text-slate-900 text-sm">{perkara.penetapan.ketua_majelis}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Anggota Majelis Pemeriksa:</span>
                      <ul className="list-disc list-inside text-slate-800 font-semibold space-y-0.5 mt-0.5">
                        {perkara.penetapan.anggota_majelis.map((anggota, i) => (
                          <li key={i}>{anggota}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 text-[11px] text-amber-800 italic">
                      * Jumlah Majelis: {1 + perkara.penetapan.anggota_majelis.length} orang (Memenuhi syarat minimal 
                      {perkara.jalur === 'tsm' ? ' 3 orang untuk TSM' : ' 2 orang untuk biasa'}).
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-700" />
                    <span>Tim Pendukung Sidang (Pasal 14–16)</span>
                  </h4>
                  <div className="text-xs space-y-2.5">
                    <div>
                      <span className="text-slate-500 font-medium block">Sekretaris Pemeriksa:</span>
                      <span className="font-bold text-slate-900">{perkara.penetapan.sekretaris_pemeriksa}</span>
                      <span className="text-[11px] text-slate-500 block">Menyiapkan sidang, menyusun ADM.BA-SP & ceklis bukti</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Asisten Pemeriksa:</span>
                      <span className="font-bold text-slate-900">{perkara.penetapan.asisten_pemeriksa}</span>
                      <span className="text-[11px] text-slate-500 block">Menyiapkan materi kajian yuridis, ringkasan bukti & draf putusan</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium block">Perisalah Sidang:</span>
                      <span className="font-bold text-slate-900">{perkara.penetapan.perisalah}</span>
                      <span className="text-[11px] text-slate-500 block">Menyusun risalah sidang lengkap (ADM.RISALAH) per sesi</span>
                    </div>
                    {perkara.penetapan.juru_sumpah && (
                      <div>
                        <span className="text-slate-500 font-medium block">Juru Sumpah / Protokol:</span>
                        <span className="font-bold text-slate-900">{perkara.penetapan.juru_sumpah}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                <p className="font-medium text-xs">Majelis Pemeriksa belum ditetapkan oleh Ketua Bawaslu.</p>
                {isInternal && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Masuk ke Ruang Kerja Internal untuk membuat Keputusan Penetapan Majelis.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Jadwal Sidang (Bab 6.3 & Gambar 3) */}
        {activeTab === 'jadwal_sidang' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span>Jadwal Persidangan Terbuka</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tata Urutan: Pembacaan → Jawaban → Pembuktian → Kesimpulan → Putusan (Pasal 17 ayat 2)
                </p>
              </div>

              {isInternal && (
                <button
                  onClick={() => onOpenSidangSimulator(perkara)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-600 px-3 py-1.5 rounded-lg shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Jalankan Sidang Aktif</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b uppercase">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-28">Tanggal Sidang</th>
                    <th className="py-2.5 px-3 w-24">Jam</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Agenda Sidang</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Ruang / Tautan Daring</th>
                    <th className="py-2.5 px-3 w-28 text-center">Status</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Alasan Ditunda / Catatan</th>
                    <th className="py-2.5 px-3 w-28 text-center">Siaran Langsung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perkara.jadwal_sidang && perkara.jadwal_sidang.length > 0 ? (
                    perkara.jadwal_sidang.map((sidang) => (
                      <tr key={sidang.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-600">
                          {sidang.ke}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                          {sidang.tanggal}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">
                          {sidang.jam}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          {sidang.agenda}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <span className="block font-medium">{sidang.lokasi_atau_tautan}</span>
                          <span className="text-[10px] text-slate-500 font-mono">Mode: {sidang.mode}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            sidang.status === 'Terlaksana'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sidang.status === 'Ditunda'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {sidang.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {sidang.alasan_ditunda || sidang.catatan_sidang || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {sidang.tautan_siaran ? (
                            <a
                              href={sidang.tautan_siaran}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded border border-red-200"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Live Stream</span>
                            </a>
                          ) : (
                            <span className="text-slate-400 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        Belum ada jadwal persidangan yang dimasukkan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Alat Bukti */}
        {activeTab === 'alat_bukti' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-700" />
                  <span>Daftar Alat Bukti (P-n dan T-n)</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pengesahan bukti dengan verifikasi checklist asli/salinan & ketuk palu Majelis 1x (Pasal 23–30)
                </p>
              </div>

              {/* Status Kecukupan 2 Bukti Sah (Pasal 36 ayat 2) */}
              <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                isBuktiCukup
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {isBuktiCukup ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                )}
                <span>
                  {buktiSahCount} Alat Bukti Disahkan (Syarat Min. 2 Bukti Sah: {isBuktiCukup ? 'Terpenuhi' : 'Belum Terpenuhi'})
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b uppercase">
                    <th className="py-2.5 px-3 w-16 text-center">Kode</th>
                    <th className="py-2.5 px-3 w-28">Pihak Pengaju</th>
                    <th className="py-2.5 px-3 w-32">Bentuk Bukti</th>
                    <th className="py-2.5 px-3 w-28">Keaslian</th>
                    <th className="py-2.5 px-3 min-w-[280px]">Uraian Materi Bukti</th>
                    <th className="py-2.5 px-3 w-32 text-center">Pengesahan Majelis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perkara.alat_bukti && perkara.alat_bukti.length > 0 ? (
                    perkara.alat_bukti.map((bukti) => (
                      <tr key={bukti.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center">
                          <span className={`font-mono font-extrabold px-2 py-0.5 rounded text-xs ${
                            bukti.kode.startsWith('P')
                              ? 'bg-blue-100 text-blue-900 border border-blue-200'
                              : 'bg-rose-100 text-rose-900 border border-rose-200'
                          }`}>
                            {bukti.kode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {bukti.pengaju}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {bukti.bentuk}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">
                          {bukti.asli_salinan}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 leading-relaxed font-sans">
                          {bukti.uraian}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {bukti.tgl_disahkan ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{bukti.tgl_disahkan}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Belum disahkan</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Belum ada alat bukti yang diajukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Saksi / Ahli / Terkait */}
        {activeTab === 'saksi_ahli' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>Keterangan Saksi, Ahli, dan Pihak/Lembaga Terkait</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Saksi dan Ahli wajib disumpah terlebih dahulu (Formulir ADM.BA-SUMPAH, Pasal 31)
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b uppercase">
                    <th className="py-2.5 px-3 w-12 text-center">No</th>
                    <th className="py-2.5 px-3 w-28">Jenis</th>
                    <th className="py-2.5 px-3 w-48">Nama</th>
                    <th className="py-2.5 px-3 w-28">Pengaju</th>
                    <th className="py-2.5 px-3 w-32 text-center">Status Sumpah</th>
                    <th className="py-2.5 px-3 min-w-[280px]">Ringkasan Pokok Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perkara.keterangan && perkara.keterangan.length > 0 ? (
                    perkara.keterangan.map((ket, idx) => (
                      <tr key={ket.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {ket.jenis}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{ket.nama}</td>
                        <td className="py-2.5 px-3 text-slate-700">{ket.pengaju}</td>
                        <td className="py-2.5 px-3 text-center">
                          {ket.sumpah ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>ADM.BA-SUMPAH</span>
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-[11px] font-bold">
                              Belum Sumpah
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800 leading-relaxed font-sans">
                          {ket.ringkasan}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Belum ada saksi, ahli, atau pihak terkait yang diperiksa.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Putusan */}
        {activeTab === 'putusan' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <Gavel className="w-4 h-4 text-amber-700" />
                <span>Salinan Putusan & Publikasi ADM.STATUS</span>
              </h3>
              {perkara.putusan && (
                <span className="text-xs font-mono font-bold text-red-800 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                  Nomor: {perkara.putusan.nomor_putusan}
                </span>
              )}
            </div>

            {perkara.putusan ? (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-semibold uppercase">Amar Putusan:</span>
                      <span className={`px-2.5 py-1 rounded text-xs font-extrabold ${
                        perkara.putusan.amar === 'Terbukti'
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-700 text-white'
                      }`}>
                        {perkara.putusan.amar.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 font-mono">
                      Pleno: {perkara.putusan.tgl_pleno} | Sidang Pembacaan: {perkara.putusan.tgl_dibacakan}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      AMAR PUTUSAN LENGKAP:
                    </span>
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs font-serif leading-relaxed text-slate-900 whitespace-pre-line shadow-xs">
                      {perkara.putusan.amar_lengkap}
                    </div>
                  </div>

                  {perkara.putusan.sanksi && perkara.putusan.sanksi.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        SANKSI YANG DIJATUHKAN (Pasal 37 ayat 2):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {perkara.putusan.sanksi.map((s, i) => (
                          <span key={i} className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-xs border border-amber-300">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
                    <div className="flex items-center gap-3">
                      <span>Salinan Para Pihak: {perkara.putusan.tgl_salinan || '≤ 1 HK (Pasal 38)'}</span>
                      <span>Publikasi Laman: {perkara.putusan.tgl_publikasi || 'ADM.STATUS Resmi'}</span>
                    </div>

                    <button
                      onClick={() => onOpenFormGenerator(perkara, 'ADM.PUTUSAN')}
                      className="inline-flex items-center gap-1.5 bg-red-700 hover:bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh Salinan Putusan Resmi</span>
                    </button>
                  </div>
                </div>

                {/* Masa Permintaan Koreksi (Pasal 45) */}
                {perkara.tingkatan !== 'BWSL' && perkara.jalur !== 'acara_cepat' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5">
                        <GitPullRequestDraft className="w-4 h-4 text-blue-700" />
                        <span>Masa Permintaan Koreksi ke Bawaslu RI (Pasal 45)</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                        Tenggat: ≤ 3 Hari Kerja
                      </span>
                    </div>
                    <p className="text-xs text-blue-900 leading-relaxed">
                      Para pihak (Pelapor/Penemu atau Terlapor) berhak mengajukan permintaan koreksi kepada Bawaslu RI
                      dalam waktu paling lambat 3 (tiga) hari kerja sejak putusan dibacakan, terbatas pada alasan kesalahan penerapan hukum.
                    </p>
                    {canAjukanKoreksi && (
                      <div className="pt-2">
                        <button
                          onClick={() => onOpenKoreksiModal(perkara)}
                          className="bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          Ajukan Permintaan Koreksi ke Bawaslu RI Sekarang
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed">
                <p className="font-medium text-xs">Putusan belum dibacakan dalam sidang terbuka.</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Batas putusan: {perkara.batas_putusan} ({perkara.sisa_hk} HK tersisa).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Koreksi (Bab 4.3 & Diagram 3) */}
        {activeTab === 'koreksi' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                <GitPullRequestDraft className="w-4 h-4 text-amber-700" />
                <span>Alur Permintaan Koreksi di Bawaslu RI (Pasal 44–54)</span>
              </h3>
            </div>

            {perkara.koreksi ? (
              <div className="space-y-4">
                {/* Penanda Penundaan Eksekusi (Pasal 54) */}
                <div className="p-3 bg-red-100 border border-red-300 rounded-xl flex items-center gap-2.5 text-red-900 font-bold text-xs">
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
                  <span>
                    PERHATIAN (PASAL 54): Pelaksanaan putusan Bawaslu Provinsi/Kabupaten/Kota DITUNDA selama proses koreksi berjalan di Bawaslu RI.
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block font-semibold">Nomor Register Koreksi (KS):</span>
                      <span className="font-mono font-bold text-blue-900 text-sm">{perkara.koreksi.nomor_KS}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Pemohon Koreksi:</span>
                      <span className="font-bold text-slate-900">{perkara.koreksi.nama_pemohon} ({perkara.koreksi.pemohon})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Tanggal Diajukan & Register:</span>
                      <span className="font-mono text-slate-900">{perkara.koreksi.tgl_diajukan} (Reg: {perkara.koreksi.tgl_register})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block font-semibold">Tenggat Putusan Koreksi:</span>
                      <span className="font-mono text-slate-900">≤ 7 Hari Kerja sejak registrasi (Pasal 51)</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <span className="text-slate-500 block font-semibold mb-1">
                      Alasan Koreksi (Kesalahan Penerapan Hukum):
                    </span>
                    <p className="p-3 bg-white rounded border text-slate-800 italic leading-relaxed">
                      {perkara.koreksi.alasan_koreksi}
                    </p>
                  </div>

                  {perkara.koreksi.amar_koreksi && (
                    <div className="p-3 bg-white rounded-lg border border-slate-300">
                      <span className="text-xs font-bold text-slate-700 block mb-1">
                        PUTUSAN KOREKSI BAWASLU RI:
                      </span>
                      <span className="font-bold text-sm text-purple-900">
                        {perkara.koreksi.amar_koreksi}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed space-y-2">
                <p className="font-medium text-xs">Belum ada permohonan koreksi yang diajukan untuk perkara ini.</p>
                {canAjukanKoreksi && (
                  <button
                    onClick={() => onOpenKoreksiModal(perkara)}
                    className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <GitPullRequestDraft className="w-3.5 h-3.5" />
                    <span>Ajukan Permintaan Koreksi</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 8: Riwayat Perkara (Bab 6.3 & Gambar 3) */}
        {activeTab === 'riwayat' && (
          <div className="p-4 sm:p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2 border-b pb-2">
              <History className="w-4 h-4 text-amber-700" />
              <span>Log Kronologis Riwayat Perkara & Dokumen Formulir Terbit</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b uppercase">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-36">Waktu / Tanggal</th>
                    <th className="py-2.5 px-3 w-36">Tahapan</th>
                    <th className="py-2.5 px-3 min-w-[280px]">Uraian Proses Hukum</th>
                    <th className="py-2.5 px-3 w-36">Dokumen Resmi</th>
                    <th className="py-2.5 px-3 w-36">Pengguna / Peran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {perkara.riwayat && perkara.riwayat.length > 0 ? (
                    perkara.riwayat.map((rw, idx) => (
                      <tr key={rw.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-700 whitespace-nowrap">{rw.waktu}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{rw.tahapan}</td>
                        <td className="py-2.5 px-3 text-slate-900 leading-relaxed font-sans">{rw.proses}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold text-blue-900">
                          {rw.dokumen_nama ? (
                            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.5 rounded">
                              {rw.dokumen_nama}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="font-medium text-slate-800 block">{rw.pengguna}</span>
                          <span className="text-[10px] text-slate-400">{rw.peran}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Log kronologis perkara tersimpan otomatis sesuai peristiwa persidangan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
