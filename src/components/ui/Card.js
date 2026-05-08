export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={[
        "rounded-xl border border-white/10 bg-[#0f1620] p-5 shadow-md shadow-black/30",
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
