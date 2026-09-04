import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({
  children,
  width = "wide",
}: {
  children: ReactNode;
  width?: "wide" | "narrow" | "full";
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full px-5 py-8 md:py-12",
        width === "narrow" && "max-w-2xl",
        width === "wide" && "max-w-4xl",
        width === "full" && "max-w-6xl",
      )}
    >
      {children}
    </main>
  );
}

export function Crumb({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      {label}
    </Link>
  );
}

export function Heading({
  title,
  lead,
  eyebrow,
}: {
  title: string;
  lead?: string;
  eyebrow?: string;
}) {
  return (
    <header className="mb-7">
      {eyebrow && (
        <p className="mb-2 text-xs font-medium tracking-wide text-primary">{eyebrow}</p>
      )}
      <h1 className="text-2xl font-bold leading-snug md:text-[1.75rem]">{title}</h1>
      {lead && <p className="mt-2 max-w-prose text-[0.95rem] text-muted-foreground">{lead}</p>}
    </header>
  );
}

export function Section({
  title,
  note,
  children,
  action,
}: {
  title: string;
  note?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="surface mb-5 p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

type BtnVariant = "primary" | "quiet" | "ghost" | "danger";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  quiet: "border border-border bg-card text-foreground hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "border border-border bg-card text-destructive hover:bg-fail",
};

export function Btn({
  variant = "quiet",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cn(
        btnBase,
        btnVariants[variant],
        size === "sm" && "px-2.5 py-1.5 text-xs",
        size === "md" && "px-4 py-2",
        size === "lg" && "px-6 py-3 text-base",
        className,
      )}
      {...props}
    />
  );
}

export function LinkBtn({
  to,
  params,
  children,
  variant = "quiet",
  size = "md",
  className,
}: {
  to: string;
  params?: Record<string, string>;
  children: ReactNode;
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      params={params as any}
      className={cn(
        btnBase,
        btnVariants[variant],
        size === "sm" && "px-2.5 py-1.5 text-xs",
        size === "md" && "px-4 py-2",
        size === "lg" && "px-6 py-3 text-base",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function Chip({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "pass" | "fail" | "note" | "accent";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        tone === "muted" && "bg-muted text-muted-foreground",
        tone === "pass" && "bg-pass text-pass-foreground",
        tone === "fail" && "bg-fail text-fail-foreground",
        tone === "note" && "bg-note text-note-foreground",
        tone === "accent" && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {hint && <span className="mb-1.5 block text-xs text-muted-foreground">{hint}</span>}
      {children}
    </label>
  );
}

export function ChoiceCard({
  to,
  params,
  title,
  note,
  meta,
}: {
  to: string;
  params?: Record<string, string>;
  title: string;
  note?: string;
  meta?: ReactNode;
}) {
  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      to={to as any}
      params={params as any}
      className="surface block p-4 transition-colors hover:border-primary/50 hover:bg-muted/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold leading-snug">{title}</p>
          {note && <p className="mt-1 text-sm text-muted-foreground">{note}</p>}
        </div>
        <span className="text-primary" aria-hidden>
          ←
        </span>
      </div>
      {meta && <div className="mt-3 flex flex-wrap gap-1.5">{meta}</div>}
    </Link>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}
