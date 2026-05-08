export default function Input({ className = "", type = "text", ...props }) {
  return (
    <input
      type={type}
      className={[
        "h-11 w-full rounded-xl border border-white/10 bg-[#0b0f14] px-4 text-sm text-slate-100 shadow-sm transition-colors",
        "placeholder:text-slate-500 focus:border-[#480556] focus:outline-none focus:ring-4 focus:ring-[#480556]/20",
        "disabled:cursor-not-allowed disabled:bg-black/20 disabled:text-slate-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
