import { useState } from "react";
import { useLang } from "../context/LangContext";
import { Building2, MessageCircle } from "lucide-react";

const amounts = [50000, 100000, 250000, 500000, 1000000];

export default function DonasiPage() {
  const { t } = useLang();
  const [form, setForm] = useState({ name: "", email: "", amount: 100000, customAmount: "", message: "" });
  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAmount = form.customAmount ? parseInt(form.customAmount) : form.amount;
    const waMessage = `Halo Admin KBB Sadunia,\n\nSaya ingin mengonfirmasi donasi saya:\nNama: ${form.name}\nEmail: ${form.email}\nNominal: Rp ${finalAmount.toLocaleString("id-ID")}\nPesan: ${form.message || "-"}\n\nMohon informasi lebih lanjut. Terima kasih.`;
    const waUrl = `https://wa.me/6281122334455?text=${encodeURIComponent(waMessage)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="news-divider-bold mb-4" />
      <h1 className="text-2xl font-bold text-surface-900 mb-1">{t("donate.title")}</h1>
      <p className="text-surface-500 mb-8">{t("donate.desc")}</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-surface-200 p-6 space-y-5">
        {/* Amount */}
        <fieldset>
          <legend className="block text-sm font-medium text-surface-700 mb-2">{t("donate.amount")}</legend>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
            {amounts.map((a) => (
              <button key={a} type="button" onClick={() => setForm((p) => ({ ...p, amount: a, customAmount: "" }))}
                className={`py-2 rounded-lg text-sm font-semibold border transition-all ${form.amount === a && !form.customAmount ? "bg-primary-600 text-white border-primary-600" : "bg-white text-surface-700 border-surface-200 hover:border-primary-300"}`}>
                {(a / 1000)}K
              </button>
            ))}
          </div>
          <label htmlFor="custom-amount" className="sr-only">Nominal lain</label>
          <input id="custom-amount" type="number" min="1000" placeholder="Nominal lain (Rp)" value={form.customAmount} onChange={(e) => setForm((p) => ({ ...p, customAmount: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400" />
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="donate-name" className="block text-sm font-medium text-surface-700 mb-1">{t("donate.name")} *</label>
            <input id="donate-name" type="text" value={form.name} onChange={set("name")} required className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
          <div>
            <label htmlFor="donate-email" className="block text-sm font-medium text-surface-700 mb-1">{t("donate.email")} *</label>
            <input id="donate-email" type="email" value={form.email} onChange={set("email")} required className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
          </div>
        </div>

        <div>
          <label htmlFor="donate-message" className="block text-sm font-medium text-surface-700 mb-1">{t("donate.message")}</label>
          <textarea id="donate-message" value={form.message} onChange={set("message")} rows={2} className="w-full px-3 py-2.5 rounded-lg border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none" />
        </div>

        {/* Payment instruction */}
        <div className="p-4 rounded-lg bg-surface-50 border border-surface-200 mt-2">
          <p className="text-sm text-surface-600 mb-2">Saat ini kami hanya menerima donasi melalui transfer bank manual. Silakan transfer donasi Anda ke rekening resmi kami:</p>
          <div className="flex items-center gap-3">
            <Building2 size={34} className="text-primary-700 shrink-0" />
            <div>
              <p className="font-bold text-surface-900">Bank Kalsel</p>
              <p className="font-mono text-primary-700 font-bold tracking-wider">001-234-5678</p>
              <p className="text-xs text-surface-500 uppercase">a.n. Kerukunan Bubuhan Banjar Sadunia</p>
            </div>
          </div>
        </div>

        <button type="submit" className="w-full py-3 rounded-lg bg-[#25D366] text-white font-bold hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2">
          <MessageCircle size={20} />
          Konfirmasi Donasi via WhatsApp
        </button>
      </form>
    </div>
  );
}
