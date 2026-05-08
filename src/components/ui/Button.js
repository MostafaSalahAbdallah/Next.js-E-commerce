import Link from "next/link";

const variants = {
  primary:
    "bg-[#744577] text-white shadow-sm hover:bg-[#5d375f] focus-visible:outline-[#744577]",
  secondary:
    "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 focus-visible:outline-[#accfa3]",
  ghost:
    "text-slate-200 hover:bg-white/10 hover:text-white focus-visible:outline-[#accfa3]",
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
