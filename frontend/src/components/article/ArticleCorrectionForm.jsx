export default function ArticleCorrectionForm({
  correction,
  correctionMsg,
  onChange,
  onSubmit,
  submitting,
}) {
  return (
    <section className="mt-10 bg-surface-50 border border-surface-200 p-6">
      <h3 className="text-[12px] font-black uppercase tracking-[0.18em] text-surface-900 mb-2">
        Laporkan Koreksi
      </h3>
      <p className="text-sm text-surface-600 font-medium mb-5">
        Menemukan kekeliruan nama, tanggal, lokasi, atau sumber? Kirim catatan koreksi ke redaksi.
      </p>

      {correctionMsg.text && (
        <div className={`mb-4 p-3 text-sm font-semibold border-l-4 ${
          correctionMsg.type === "success"
            ? "bg-green-50 text-green-800 border-green-600"
            : "bg-red-50 text-red-800 border-red-600"
        }`}>
          {correctionMsg.text}
        </div>
      )}

      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-3">
        <input
          value={correction.name}
          onChange={(event) => onChange("name", event.target.value)}
          placeholder="Nama (opsional)"
          className="px-4 py-3 bg-white border border-surface-300 text-sm font-medium focus:outline-none focus:border-primary-600"
        />
        <input
          type="email"
          value={correction.email}
          onChange={(event) => onChange("email", event.target.value)}
          placeholder="Email (opsional)"
          className="px-4 py-3 bg-white border border-surface-300 text-sm font-medium focus:outline-none focus:border-primary-600"
        />
        <textarea
          value={correction.message}
          onChange={(event) => onChange("message", event.target.value)}
          placeholder="Tulis bagian yang perlu dikoreksi..."
          rows={4}
          className="sm:col-span-2 px-4 py-3 bg-white border border-surface-300 text-sm font-medium focus:outline-none focus:border-primary-600 resize-y"
          required
        />
        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-surface-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary-900 transition-colors disabled:opacity-50"
          >
            {submitting ? "Mengirim..." : "Kirim Koreksi"}
          </button>
        </div>
      </form>
    </section>
  );
}
