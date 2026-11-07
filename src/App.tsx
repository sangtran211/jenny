import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatViewport } from './components/ChatViewport';
import { Composer } from './components/Composer';
import { useChatStore } from './hooks/useChatStore';
import { useModelCatalogSync } from './hooks/useModels';

function App() {
  const { isHydrated } = useChatStore();
  useModelCatalogSync();
  // Open by default on desktop; on a phone it is a drawer over the chat, so start closed.
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === 'undefined' || window.matchMedia('(min-width: 1024px)').matches
  );

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted font-serif text-lg">
        Đang khởi tạo Jenny Atelier...
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-primary">
      <Sidebar isOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col relative min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-hidden flex flex-col">
          <ChatViewport />
          <Composer />
        </main>
      </div>
    </div>
  );
}

export default App;

