import React, { useState } from 'react';
import { X, Lock, Key, User, ShieldCheck, AlertCircle, Eye, EyeOff, UserPlus, CheckCircle2 } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
  currentUsername: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentUsername
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [usernameInput, setUsernameInput] = useState<string>(currentUsername || 'admin_banten');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('Administrator Bawaslu Banten');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const savedAccountsRaw = localStorage.getItem('leadap_admin_accounts');
    let accounts: Record<string, string> = {
      admin_banten: 'Bawaslu2028!',
      admin: 'admin123'
    };

    if (savedAccountsRaw) {
      try {
        accounts = { ...accounts, ...JSON.parse(savedAccountsRaw) };
      } catch (err) {
        console.error(err);
      }
    }

    const trimmedUser = usernameInput.trim();
    if (accounts[trimmedUser] && accounts[trimmedUser] === passwordInput) {
      localStorage.setItem('leadap_admin_session', 'true');
      localStorage.setItem('leadap_current_admin', trimmedUser);
      onLoginSuccess(trimmedUser);
      onClose();
    } else {
      setErrorMsg('Username atau kata sandi tidak valid. Pastikan username dan kata sandi sesuai!');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const trimmedUser = usernameInput.trim();
    if (!trimmedUser || trimmedUser.length < 3) {
      setErrorMsg('Username minimal 3 karakter.');
      return;
    }

    if (passwordInput.length < 5) {
      setErrorMsg('Kata sandi minimal 5 karakter.');
      return;
    }

    if (passwordInput !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    const savedAccountsRaw = localStorage.getItem('leadap_admin_accounts');
    let accounts: Record<string, string> = {
      admin_banten: 'Bawaslu2028!',
      admin: 'admin123'
    };

    if (savedAccountsRaw) {
      try {
        accounts = { ...accounts, ...JSON.parse(savedAccountsRaw) };
      } catch (err) {
        console.error(err);
      }
    }

    accounts[trimmedUser] = passwordInput;
    localStorage.setItem('leadap_admin_accounts', JSON.stringify(accounts));
    localStorage.setItem('leadap_admin_session', 'true');
    localStorage.setItem('leadap_current_admin', trimmedUser);

    setSuccessMsg(`Akun Administrator "${trimmedUser}" berhasil dibuat dan diaktifkan!`);
    setTimeout(() => {
      onLoginSuccess(trimmedUser);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 p-5 text-white flex items-center justify-between border-b border-amber-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">
                {mode === 'login' ? 'AUTENTIKASI ADMINISTRATOR' : 'BUAT AKUN ADMINISTRATOR'}
              </h3>
              <p className="text-[11px] text-amber-300 font-mono">
                Bawaslu Provinsi Banten — Hak Akses Penuh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2.5 transition-colors ${
              mode === 'login'
                ? 'bg-white text-red-900 border-b-2 border-red-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk Admin
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2.5 transition-colors ${
              mode === 'register'
                ? 'bg-white text-red-900 border-b-2 border-red-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Buat Akun / Password Baru
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="p-6 space-y-4 text-xs">
          {mode === 'login' ? (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-950 text-xs leading-relaxed space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Akses Khusus Admin Bawaslu</span>
              </span>
              <p className="text-[11px] text-amber-800">
                Admin memiliki otoritas penuh untuk menambah, mengedit, dan menghapus seluruh perkara, jadwal, bukti, serta putusan.
              </p>
              <div className="pt-1 text-[11px] font-mono text-slate-600 bg-white/80 p-1.5 rounded border border-amber-200/80">
                Default: Username: <strong className="text-blue-900">admin_banten</strong> | Password: <strong className="text-red-900">Bawaslu2028!</strong>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-950 text-xs leading-relaxed">
              <span className="font-bold flex items-center gap-1.5 text-blue-900 mb-1">
                <UserPlus className="w-4 h-4 text-blue-700" />
                <span>Pendaftaran Akun Administrator</span>
              </span>
              <p className="text-[11px] text-blue-800">
                Buat username dan kata sandi admin baru untuk mengelola portal sidang administratif LeAD-AP Bawaslu Banten.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Nama Lengkap / Instansi:</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="cth: Pengawas Pemilu Banten"
                className="w-full px-3 py-2 border rounded-lg bg-white font-medium text-xs text-slate-800"
                required
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Username Administrator:</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Masukkan username admin..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 font-medium text-xs text-slate-800"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Kata Sandi (Password):</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Masukkan kata sandi..."
                className="w-full pl-9 pr-10 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 font-medium text-xs text-slate-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Konfirmasi Kata Sandi:</label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi..."
                  className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-amber-500 font-medium text-xs text-slate-800"
                  required
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-700 hover:bg-red-600 text-white font-bold rounded-lg shadow-md hover:shadow-red-600/30 transition-all flex items-center gap-1.5"
            >
              {mode === 'login' ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Masuk Sebagai Admin</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Simpan & Aktifkan Akun</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
