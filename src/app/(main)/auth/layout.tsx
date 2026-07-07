import { ReactNode } from 'react';

interface LayoutProps {
  readonly children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <main>
      <div className="lg:flex h-screen w-full items-center justify-center">{children}</div>
    </main>
  );
}
