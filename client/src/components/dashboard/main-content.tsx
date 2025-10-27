import { ReactNode } from "react";

interface MainContentProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export function MainContent({ leftContent, rightContent }: MainContentProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        {leftContent}
      </div>
      <div className="space-y-6">
        {rightContent}
      </div>
    </div>
  );
}