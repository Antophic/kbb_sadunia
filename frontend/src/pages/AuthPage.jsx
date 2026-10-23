import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiLogin, apiForgotPassword } from "../services/api";
import OptimizedImage from "../components/OptimizedImage";

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: null }));
    if (successMsg) setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await apiLogin(form.email, form.password);
        login(res.user);
        setSuccessMsg("Autentikasi berhasil. Mengalihkan ke dashboard...");
        // Redirect langsung ke admin dashboard
        setTimeout(() => navigate("/admin"), 1000);
      } else if (mode === "forgot") {
        const res = await apiForgotPassword(form.email);
        setSuccessMsg(res.message || "Instruksi reset password telah dikirim ke email Anda.");
      }
    } catch (err) {
      setErrors({ email: err.message || "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-184px)] flex flex-col md:flex-row bg-white font-sans">
      {/* Left Panel - Imagery/Branding */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-surface-950 relative flex-col justify-between p-10 lg:p-12 overflow-hidden">
        {/* Real KBB activity photo with readable overlay */}
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            src="/pelantikan/bali-kesbangpol-3.jpg" 
            alt="" 
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            sizes="(min-width: 1024px) 60vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/70 to-surface-950/20"></div>
          <div className="absolute inset-0 bg-primary-950/20"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white tracking-tight">KBB<span className="text-primary-500">Sadunia</span>.</h1>
          </Link>
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-3 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-200 backdrop-blur">
            Foto kegiatan KBB
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
            Portal Berita Kerukunan Bubuhan Banjar Sadunia
          </h2>
          <p className="text-surface-200 text-base lg:text-lg leading-relaxed">
            Dapatkan akses ke berita terkini, artikel mendalam, dan informasi eksklusif komunitas Banjar di seluruh dunia.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-lg">
            <OptimizedImage src="/pelantikan/pp-kbb-mahligai-2023.jpg" alt="" className="aspect-[4/3] w-full rounded-sm border border-white/20 object-cover shadow-lg" sizes="180px" />
            <OptimizedImage src="/pelantikan/bali-kesbangpol-2.jpg" alt="" className="aspect-[4/3] w-full rounded-sm border border-white/20 object-cover shadow-lg" sizes="180px" />
            <OptimizedImage src="/pelantikan/kbb-kepri-rri-2025.jpg" alt="" className="aspect-[4/3] w-full rounded-sm border border-white/20 object-cover shadow-lg" sizes="180px" />
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center px-8 sm:px-12 py-16 bg-white relative">
        {/* Mobile Header */}
        <div className="md:hidden absolute top-8 left-8">
          <Link to="/">
            <h1 className="text-2xl font-bold text-surface-900">KBB<span className="text-primary-600">Sadunia</span>.</h1>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-surface-900 tracking-tight mb-2">
              {mode === "login" ? "Selamat Datang" : "Reset Password"}
            </h2>
            <p className="text-surface-500">
              {mode === "login" 
                ? "Masukkan email dan password untuk melanjutkan." 
                : "Masukkan email yang terdaftar untuk mengatur ulang sandi."}
            </p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 rounded bg-green-50 text-green-800 border-l-4 border-green-500 text-sm font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium text-surface-700 mb-1.5">Alamat Email</label>
              <input 
                id="auth-email" type="email" value={form.email} onChange={set("email")} required autoComplete="email"
                className={`block w-full px-4 py-3 rounded-md border-surface-300 bg-surface-50 text-surface-900 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border'}`} 
                placeholder="nama@email.com"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1.5">{errors.email}</p>}
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="auth-password" className="block text-sm font-medium text-surface-700">Password</label>
                  {mode === "login" && (
                    <button type="button" onClick={() => { setMode("forgot"); setErrors({}); setSuccessMsg(""); }} className="text-sm font-semibold text-primary-600 hover:text-primary-700">Lupa password?</button>
                  )}
                </div>
                <input 
                  id="auth-password" type="password" value={form.password} onChange={set("password")} required minLength={1} maxLength={128} autoComplete="current-password"
                  className={`block w-full px-4 py-3 rounded-md border-surface-300 bg-surface-50 text-surface-900 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${errors.password ? 'border-red-500 ring-1 ring-red-500' : 'border'}`} 
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-xs text-red-600 mt-1.5">{errors.password}</p>}
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2005/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Kirim Tautan Reset"}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-surface-200 pt-6">
            {mode === "forgot" ? (
              <p className="text-sm text-surface-600">
                Sudah ingat password? <button onClick={() => { setMode("login"); setErrors({}); setSuccessMsg(""); }} className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">Kembali ke Login</button>
              </p>
            ) : (
              <p className="text-sm text-surface-600">
                Butuh akun penulis? Hubungi admin redaksi untuk dibuatkan akses.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
