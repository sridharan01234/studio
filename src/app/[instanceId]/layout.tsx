
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getInstance } from '@/services/instanceService';
import { notFound } from 'next/navigation';

export default async function InstanceLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { instanceId: string };
}>) {
  const instance = await getInstance(params.instanceId);
  if (!instance) {
    notFound();
  }

  return (
    <SidebarProvider>
      <div className="flex h-full w-full">
        <AppSidebar instance={instance} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
