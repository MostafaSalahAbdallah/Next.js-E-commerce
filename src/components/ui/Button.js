import Link from "next/link";

const variants = {
  primary:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:outline-emerald-600",
  secondary:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 focus-visible:outline-slate-500",
  ghost:
    "text-slate-700 hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-slate-500",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

export default function Button({
  children,
  className = "",
  href,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}) {
  const buttonClassName = [
    "inline-flex items-center justify-center rounded-xl font-semibold transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant] || variants.primary,
    sizes[size] || sizes.md,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={buttonClassName} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={buttonClassName} {...props}>
      {children}
    </button>
  );
}
