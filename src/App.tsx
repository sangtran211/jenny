import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatViewport } from './components/ChatViewport';
import { Composer } from './components/Composer';
import { useChatStore } from './hooks/useChatStore';

function App() {
  const { isHydrated } = useChatStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted font-serif text-lg">
        Đang khởi tạo Jenny Atelier...
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-primary">
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

