import React, { useState, useRef } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FilePlus2, 
  ShieldCheck, 
  ArrowRight, 
  Save, 
  Scale, 
  HardDrive, 
  Paperclip, 
  Trash2, 
  UploadCloud 
} from 'lucide-react';
import { 
  Perkara, 
  JalurPenyelesaian, 
  SumberPerkara, 
  KodeJenisPerkara, 
  TingkatanBawaslu,
  AlatBukti 
} from '../types/leadAp';
import { 
  generateNomorRegister, 
  KODE_WILAYAH_BAWASLU, 
  TAHAPAN_PEMILU_LIST, 
  tambahHariKerja 
} from '../utils/businessLogic';
import { 
  getCachedAccessToken, 
  uploadBuktiToDrive, 
  uploadDokumenSidangToDrive,
  TARGET_DRIVE_EMAIL 
} from '../services/googleDriveService';

interface RegistrasiPerkaraModalProps {
  onClose: () => void;
  onSavePerkara: (newPerkara: Perkara) => void;
}

export const RegistrasiPerkaraModal: React.FC<RegistrasiPerkaraModalProps> = ({
  onClose,
  onSavePerkara
}) => {
  const today = new Date().toISOString().split('T')[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [sumber, setSumber] = useState<SumberPerkara>('LP');
  const [jalur, setJalur] = useState<JalurPenyelesaian>('biasa');
  const [kodeJenis, setKodeJenis] = useState<KodeJenisPerkara>('ADM.PL');
  const [tingkatan, setTingkatan] = useState<TingkatanBawaslu>('BWSL.PROV');
  const [selectedWilayah, setSelectedWilayah] = useState(KODE_WILAYAH_BAWASLU[1]); // Default Banten 11.00
  const [tahapanPemilu, setTahapanPemilu] = useState<string>(TAHAPAN_PEMILU_LIST[4]);
  const [tglPeristiwa, setTglPeristiwa] = useState<string>(today);

  // Pasal 12 Check: Pasca Penetapan Hasil Nasional & PHPU MK
  const [flagPascaPenetapan, setFlagPascaPenetapan] = useState<boolean>(false);
  const [flagPHPU, setFlagPHPU] = useState<boolean>(false);

  // Syarat Formal & Materiel (Pasal 10)
  const [syaratFormal, setSyaratFormal] = useState<boolean>(true);
  const [syaratMateriel, setSyaratMateriel] = useState<boolean>(true);

  // Pelapor & Terlapor
  const [namaPelapor, setNamaPelapor] = useState<string>('');
  const [jenisPelapor, setJenisPelapor] = useState<any>('Perorangan');
  const [alamatPelapor, setAlamatPelapor] = useState<string>('');
  const [kontakPelapor, setKontakPelapor] = useState<string>('');

  const [namaTerlapor, setNamaTerlapor] = useState<string>('');
  const [jenisTerlapor, setJenisTerlapor] = useState<any>('Penyelenggara Pemilu (KPU)');

  // Kuasa Hukum
  const [adaKuasa, setAdaKuasa] = useState<boolean>(false);
  const [namaKuasa, setNamaKuasa] = useState<string>('');

  // Pokok & Petitum
  const [pokokLaporan, setPokokLaporan] = useState<string>('');
  const [halDimohonkan, setHalDimohonkan] = useState<string>('');

  // Attached files for Google Drive storage
  const [attachedFiles, setAttachedFiles] = useState<
    { id: string; file: File; uraian: string; bentuk: any }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Mode Sidang (Pasal 35)
  const [modeSidang, setModeSidang] = useState<'Luring' | 'Daring'>('Luring');
  const [alasanDaring, setAlasanDaring] = useState<string>('');

  // Auto generated preview nomor register
  const previewNomorRegister = generateNomorRegister({
    nomorUrut: Math.floor(Math.random() * 80) + 10,
    sumber,
    kodeJenis: jalur === 'tsm' ? (kodeJenis === 'ADM.PP' ? 'ADM.TSM.PP' : 'ADM.TSM.PL') : kodeJenis,
    tingkatan,
    kodeWilayah: selectedWilayah.kode,
    tanggal: new Date()
  });

  const handleAddAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newItems: { id: string; file: File; uraian: string; bentuk: any }[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      newItems.push({
        id: 'att-' + Date.now() + '-' + i,
        file: f,
        uraian: `Lampiran berkas laporan: ${f.name}`,
        bentuk: f.type.includes('pdf') || f.name.endsWith('.pdf') ? 'Surat' : 'Dokumen Elektronik'
      });
    }
    setAttachedFiles((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachedFiles((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!syaratFormal || !syaratMateriel) {
      alert('Peringatan: Registrasi hanya dapat dilakukan bila syarat formal dan materiel terpenuhi (Pasal 10 Perbawaslu 8/2022).');
      return;
    }

    // Pasal 12 logic
    if (flagPascaPenetapan && flagPHPU) {
      alert('Peringatan (Pasal 12): Terdapat permohonan PHPU di Mahkamah Konstitusi. Laporan/Temuan tidak diregistrasi sebagai perkara biasa di Bawaslu, melainkan disampaikan sebagai keterangan tertulis kepada MK.');
      return;
    }

    setIsSubmitting(true);

    const tglReg = new Date();
    const tglBatas = tambahHariKerja(tglReg, 14);
    const batasStr = tglBatas.toISOString().split('T')[0];

    const token = getCachedAccessToken();
    const createdCaseId = 'perkara-' + Date.now();

    // Buat initial alat bukti dari file-file yang diinput
    const initialEvidence: AlatBukti[] = attachedFiles.map((att, idx) => ({
      id: 'bukti-' + Date.now() + '-' + idx,
      perkara_id: createdCaseId,
      kode: `P-${idx + 1}`,
      pengaju: 'Pelapor',
      bentuk: att.bentuk,
      asli_salinan: 'Asli',
      uraian: att.uraian || att.file.name,
      tgl_disahkan: today,
      berkas_url: undefined
    }));

    // Upload files ke Google Drive penangananpelanggaranbanten@gmail.com jika token aktif
    if (token) {
      try {
        for (let i = 0; i < attachedFiles.length; i++) {
          const item = attachedFiles[i];
          const uploaded = await uploadBuktiToDrive(
            token,
            previewNomorRegister,
            `P-${i + 1}`,
            item.file
          );
          if (uploaded?.webViewLink) {
            initialEvidence[i].berkas_url = uploaded.webViewLink;
          }
        }

        // Upload Dokumen Berita Acara Registrasi ke Google Drive
        const baContent = `BERITA ACARA REGISTRASI LAPORAN/TEMUAN (ADM.BA-REG)\nNomor Register: ${previewNomorRegister}\nWilayah: ${selectedWilayah.nama}\nPelapor: ${namaPelapor}\nTerlapor: ${namaTerlapor}\nTanggal: ${today}\nPokok: ${pokokLaporan}\nPetitum: ${halDimohonkan}\n\nDisahkan untuk diproses dalam 14 Hari Kerja sesuai Perbawaslu No 8 Tahun 2022.`;
        await uploadDokumenSidangToDrive(
          token,
          previewNomorRegister,
          'ADM.BA-REG',
          'Berita Acara Registrasi',
          baContent
        );
      } catch (uploadErr) {
        console.warn('Gagal upload lampiran ke Google Drive saat registrasi:', uploadErr);
      }
    }

    const newCase: Perkara = {
      id: createdCaseId,
      nomor_register: previewNomorRegister,
      jalur,
      sumber,
      kode_jenis: jalur === 'tsm' ? (kodeJenis === 'ADM.PP' ? 'ADM.TSM.PP' : 'ADM.TSM.PL') : kodeJenis,
      tingkatan,
      kode_wilayah: selectedWilayah.kode,
      nama_wilayah: selectedWilayah.nama,
      tahapan_pemilu: tahapanPemilu,
      tgl_peristiwa: tglPeristiwa,
      tgl_registrasi: today,
      batas_putusan: batasStr,
      lama_proses_hk: 0,
      sisa_hk: 14,
      status: 'S01', // Status awal: Diregistrasi (ADM.BA-REG)
      mode_sidang: modeSidang,
      alasan_daring: modeSidang === 'Daring' ? alasanDaring : undefined,
      flag_pasca_penetapan_hasil: flagPascaPenetapan,
      flag_PHPU_MK: flagPHPU,
      pokok_laporan: pokokLaporan,
      hal_dimohonkan: halDimohonkan,
      pelapor: {
        id: 'p-' + Date.now(),
        perkara_id: createdCaseId,
        peran: sumber === 'TM' ? 'Penemu' : 'Pelapor',
        jenis: jenisPelapor,
        nama: namaPelapor,
        alamat: alamatPelapor,
        kontak: kontakPelapor,
        flag_disamarkan: jenisPelapor === 'Perorangan'
      },
      terlapor: {
        id: 't-' + Date.now(),
        perkara_id: createdCaseId,
        peran: 'Terlapor',
        jenis: jenisTerlapor,
        nama: namaTerlapor
      },
      kuasa_pelapor: adaKuasa && namaKuasa ? {
        id: 'kp-' + Date.now(),
        perkara_id: createdCaseId,
        peran: 'Kuasa Pelapor',
        jenis: 'Perorangan',
        nama: namaKuasa,
        dasar_kuasa: 'Surat Kuasa Khusus terverifikasi'
      } : undefined,
      penetapan: {
        perkara_id: createdCaseId,
        nomor_keputusan: `0${Math.floor(Math.random()*90)+10}/KEP/${tingkatan}/${today.split('-')[0]}`,
        tanggal_keputusan: today,
        ketua_majelis: 'Drs. H. Didih M. Sudi, M.Si',
        anggota_majelis: ['Ade Mongkito, S.H.', 'Bahrul Ulum, S.Ag'],
        sekretaris_pemeriksa: 'Rina Karlina, S.Sos',
        asisten_pemeriksa: 'Danial Al-Faruq, S.H.',
        perisalah: 'Siti Rohmah, S.I.Kom'
      },
      jadwal_sidang: [],
      alat_bukti: initialEvidence,
      keterangan: [],
      dokumen: [
        {
          id: 'dok-reg-' + Date.now(),
          perkara_id: createdCaseId,
          kode_formulir: 'ADM.BA-REG',
          nama_formulir: 'Berita Acara Registrasi',
          nomor: `00${Math.floor(Math.random()*80)+10}/BA-REG/ADM/${today.split('-')[0]}`,
          tanggal: today,
          penanda_tangan: 'Petugas Registrasi',
          status_publikasi: 'Publik'
        }
      ],
      riwayat: [
        {
          id: 'rw-reg-1',
          perkara_id: createdCaseId,
          waktu: `${today} 10:00 WIB`,
          tahapan: 'Registrasi',
          proses: `Perkara dicatat di buku register; Nomor ADM.NRL ${previewNomorRegister} terbit; Berita Acara ADM.BA-REG disahkan. Terhubung ke Google Drive ${TARGET_DRIVE_EMAIL}. Timer 14 Hari Kerja dimulai.`,
          pengguna: 'Petugas Registrasi',
          peran: 'Petugas Registrasi',
          dokumen_nama: 'ADM.BA-REG'
        }
      ]
    };

    setIsSubmitting(false);
    onSavePerkara(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-4 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white flex items-center justify-between border-b border-red-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-red-800 text-amber-300">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>REGISTRASI PERKARA PELANGGARAN ADMINISTRATIF</span>
              </h2>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Penerbitan Nomor ADM.NRL & Berita Acara ADM.BA-REG (Pasal 10)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Generated Register Preview Badge */}
        <div className="bg-slate-900 text-amber-400 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase text-[10px]">Preview ADM.NRL:</span>
            <span className="font-bold text-amber-300">{previewNomorRegister}</span>
          </div>
          <span className="text-slate-400 text-[11px]">Durasi: 14 Hari Kerja (Ps. 36)</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Section 1: Jalur, Sumber & Wilayah */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Jalur Penyelesaian:</label>
              <select
                value={jalur}
                onChange={(e) => setJalur(e.target.value as any)}
                className="w-full p-2 border rounded-lg bg-white font-semibold"
              >
                <option value="biasa">Pemeriksaan Biasa (Ps. 4-39)</option>
                <option value="tsm">Jalur TSM (Ps. 55-71)</option>
                <option value="acara_cepat">Acara Cepat (Ps. 40-43)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Sumber Masukan:</label>
              <select
                value={sumber}
                onChange={(e) => setSumber(e.target.value as any)}
                className="w-full p-2 border rounded-lg bg-white font-semibold"
              >
                <option value="LP">Laporan Masyarakat (LP)</option>
                <option value="TM">Temuan Pengawas Pemilu (TM)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Jenis Pemilu:</label>
              <select
                value={kodeJenis}
                onChange={(e) => setKodeJenis(e.target.value as any)}
                className="w-full p-2 border rounded-lg bg-white font-semibold"
              >
                <option value="ADM.PL">Pemilu Legislatif / Umum (ADM.PL)</option>
                <option value="ADM.PP">Pemilihan Presiden (ADM.PP)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Tingkatan Lembaga:</label>
              <select
                value={tingkatan}
                onChange={(e) => setTingkatan(e.target.value as any)}
                className="w-full p-2 border rounded-lg bg-white font-semibold"
              >
                <option value="BWSL.PROV">Bawaslu Provinsi</option>
                <option value="BWSL.KOTA">Bawaslu Kota</option>
                <option value="BWSL.KAB">Bawaslu Kabupaten</option>
                <option value="BWSL">Bawaslu RI</option>
                <option value="PWSL.LN">Panwaslu Luar Negeri</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Wilayah / Satuan Kerja:</label>
              <select
                value={selectedWilayah.kode}
                onChange={(e) => {
                  const found = KODE_WILAYAH_BAWASLU.find(w => w.kode === e.target.value);
                  if (found) setSelectedWilayah(found);
                }}
                className="w-full p-2 border rounded-lg bg-white font-semibold"
              >
                {KODE_WILAYAH_BAWASLU.map((w) => (
                  <option key={w.kode} value={w.kode}>
                    [{w.kode}] {w.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Tahapan Pemilu:</label>
            <select
              value={tahapanPemilu}
              onChange={(e) => setTahapanPemilu(e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              {TAHAPAN_PEMILU_LIST.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Section 2: Syarat Formal & Materiel (Pasal 10) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="font-bold text-slate-800 block text-xs uppercase tracking-wide">
              Verifikasi Syarat Pendaftaran (Pasal 10 Perbawaslu 8/2022):
            </span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={syaratFormal}
                  onChange={(e) => setSyaratFormal(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Syarat Formal Terpenuhi (Identitas, Kuasa, Batas Waktu)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={syaratMateriel}
                  onChange={(e) => setSyaratMateriel(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <span>Syarat Materiel Terpenuhi (Uraian Peristiwa & Bukti Awal)</span>
              </label>
            </div>
          </div>

          {/* Section 3: Skenario Pasal 12 (Pasca Hasil Nasional) */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <span className="font-bold text-amber-950 block text-xs uppercase tracking-wide">
              Pengecekan Pasal 12 (Pasca Penetapan Hasil Perolehan Suara Nasional):
            </span>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                <input
                  type="checkbox"
                  checked={flagPascaPenetapan}
                  onChange={(e) => setFlagPascaPenetapan(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <span>Peristiwa terjadi setelah Penetapan Hasil Suara Nasional</span>
              </label>

              {flagPascaPenetapan && (
                <label className="flex items-center gap-2 cursor-pointer text-red-800 font-bold">
                  <input
                    type="checkbox"
                    checked={flagPHPU}
                    onChange={(e) => setFlagPHPU(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <span>Ada Permohonan PHPU di Mahkamah Konstitusi (MK)</span>
                </label>
              )}
            </div>
          </div>

          {/* Section 4: Data Para Pihak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block uppercase tracking-wide">
                Data {sumber === 'TM' ? 'Penemu' : 'Pelapor'}:
              </span>
              <div>
                <label className="text-slate-600 block mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={namaPelapor}
                  onChange={(e) => setNamaPelapor(e.target.value)}
                  placeholder="Nama Pelapor / Lembaga Penemu"
                  className="w-full p-2 border rounded-lg bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">Jenis Pihak:</label>
                <select
                  value={jenisPelapor}
                  onChange={(e) => setJenisPelapor(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="Perorangan">WNI yang Mempunyai Hak Pilih (Perorangan)</option>
                  <option value="Peserta Pemilu">Peserta Pemilu</option>
                  <option value="Pemantau Pemilu">Pemantau Pemilu Terdaftar</option>
                  <option value="Bawaslu Bawahan">Pengawas Pemilu (Penemu)</option>
                </select>
              </div>
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={adaKuasa}
                    onChange={(e) => setAdaKuasa(e.target.checked)}
                    className="rounded text-amber-600"
                  />
                  <span>Diwakili oleh Kuasa Hukum (Surat Kuasa Khusus)</span>
                </label>
                {adaKuasa && (
                  <input
                    type="text"
                    value={namaKuasa}
                    onChange={(e) => setNamaKuasa(e.target.value)}
                    placeholder="Nama Advokat / Kuasa Hukum..."
                    className="w-full p-2 mt-1.5 border rounded-lg bg-white"
                  />
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 block uppercase tracking-wide">
                Data Terlapor:
              </span>
              <div>
                <label className="text-slate-600 block mb-1">Nama Pihak Terlapor:</label>
                <input
                  type="text"
                  value={namaTerlapor}
                  onChange={(e) => setNamaTerlapor(e.target.value)}
                  placeholder="Nama Calon / Parpol / KPU"
                  className="w-full p-2 border rounded-lg bg-white"
                  required
                />
              </div>
              <div>
                <label className="text-slate-600 block mb-1">
                  Jenis Terlapor {jalur === 'tsm' ? '(Pasal 59: Calon/Paslon Sahaja)' : '(Pasal 8)'}:
                </label>
                <select
                  value={jenisTerlapor}
                  onChange={(e) => setJenisTerlapor(e.target.value)}
                  className="w-full p-2 border rounded-lg bg-white font-semibold"
                >
                  {jalur === 'tsm' ? (
                    <>
                      <option value="Pasangan Calon">Pasangan Calon Presiden & Wapres</option>
                      <option value="Calon Anggota DPR/DPD/DPRD">Calon Anggota DPR/DPD/DPRD</option>
                    </>
                  ) : (
                    <>
                      <option value="Penyelenggara Pemilu (KPU)">KPU / KPU Provinsi / KPU Kab/Kota</option>
                      <option value="Partai Politik">Partai Politik Peserta Pemilu</option>
                      <option value="Calon Anggota DPR/DPD/DPRD">Calon Anggota DPR / DPD / DPRD</option>
                      <option value="Pasangan Calon">Pasangan Calon</option>
                      <option value="Tim Kampanye">Tim Kampanye Terdaftar</option>
                      <option value="Penyelenggara Pemilu (PPK/KPPS)">PPK / PPS / KPPS / KPPSLN</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Pokok Laporan & Petitum */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Uraian Pokok Laporan / Temuan:</label>
            <textarea
              value={pokokLaporan}
              onChange={(e) => setPokokLaporan(e.target.value)}
              placeholder="Uraian ringkas peristiwa dan fakta dugaan pelanggaran tata cara atau prosedur administratif..."
              rows={3}
              className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 font-sans"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Hal yang Dimohonkan (Petitum):</label>
            <textarea
              value={halDimohonkan}
              onChange={(e) => setHalDimohonkan(e.target.value)}
              placeholder="1. Menyatakan Terlapor terbukti melakukan pelanggaran... 2. Memerintahkan perbaikan tata cara..."
              rows={2}
              className="w-full p-2.5 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 font-sans"
              required
            />
          </div>

          {/* Section 6: Unggah Berkas & Bukti Masukan ke Google Drive */}
          <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="font-bold text-blue-950 block text-xs flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-blue-700" />
                  <span>Lampiran Dokumen & Alat Bukti Masukan (Google Drive)</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Tersimpan langsung di Google Drive resmi: <strong className="text-blue-900 font-mono">{TARGET_DRIVE_EMAIL}</strong>
                </p>
              </div>

              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAddAttachment}
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs shadow-xs cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>+ Pilih Berkas Lampiran</span>
                </button>
              </div>
            </div>

            {attachedFiles.length > 0 ? (
              <div className="divide-y divide-blue-100 bg-white border border-blue-200 rounded-lg overflow-hidden">
                {attachedFiles.map((item, idx) => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                        P-{idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">{item.file.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {(item.file.size / 1024).toFixed(1)} KB • {item.bentuk}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(item.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded cursor-pointer"
                      title="Hapus lampiran"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">
                Opsional: Lampirkan berkas bukti awal, identitas pelapor, atau salinan laporan tertulis untuk diunggah ke Google Drive.
              </p>
            )}
          </div>

          <div className="p-4 bg-slate-100 border-t flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-red-700 hover:bg-red-600 disabled:bg-slate-400 text-white font-bold rounded-lg shadow-md flex items-center gap-2 text-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Menyimpan & Menyambungkan ke Drive...'
                  : 'Daftarkan & Terbitkan ADM.BA-REG (Mulai 14 HK)'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
