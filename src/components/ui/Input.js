export default function Input({ className = "", type = "text", ...props }) {
  return (
    <input
      type={type}
      className={[
        "h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-950 shadow-sm transition-colors",
        "placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20",
        "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
