export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={[
        "rounded-xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-200/60",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
