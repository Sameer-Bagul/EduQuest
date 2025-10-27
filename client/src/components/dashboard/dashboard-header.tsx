import { ReactNode } from "react";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function DashboardHeader({ title, subtitle, children }: DashboardHeaderProps) {
  return (
    <div className="mb-10">
      <h1 className="text-3xl font-bold text-theme mb-2">
        {title}
        {children}
      </h1>
      {subtitle && (
        <p className="text-theme-secondary text-lg">{subtitle}</p>
      )}
    </div>
  );
}