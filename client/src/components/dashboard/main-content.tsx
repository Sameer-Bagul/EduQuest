import { ReactNode } from "react";

interface MainContentProps {
  leftContent: ReactNode;
  rightContent?: ReactNode;
}

export function MainContent({ leftContent, rightContent }: MainContentProps) {
  return (
    <div className={`grid gap-8 ${rightContent ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
      <div className={rightContent ? 'lg:col-span-2' : ''}>
        {leftContent}
      </div>
      {rightContent && (
        <div className="space-y-6">
          {rightContent}
        </div>
      )}
    </div>
  );
}