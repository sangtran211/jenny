import React, { useRef, useState } from 'react';
import {
  Plus,
  MessageSquare,
  Download,
  Upload,
  Trash2,
  Search,
  Pin,
  FileText,
  Save,
  Check,
} from 'lucide-react';
import { useChatStore } from '../hooks/useChatStore';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    deleteConversation,
    togglePinConversation,
    saveSnapshotNow,
    importHistory,
    customModels,
    settings,
  } = useChatStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  if (!isOpen) return null;

  const handleSaveSnapshot = () => {
    saveSnapshotNow();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleExport = () => {
    const data = {
      app: 'Jenny Atelier AI',
      conversations,
      customModels,
      settings: { ...settings, customApiKey: '', aiStudioApiKey: '' },
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jenny-chat-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const activeConv = conversations.find((c) => c.id === activeConversationId);
    if (!activeConv) return;
    const md = [
      `# ${activeConv.title}`,
      `> Xuất từ Jenny Atelier AI (${format(new Date(), 'dd/MM/yyyy HH:mm')})`,
      '',
      ...activeConv.messages.map(
        (m) => `### ${m.role === 'user' ? 'Bạn' : 'Jenny'}\n\n${m.text}\n`
      ),
    ].join('\n');
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jenny-chat-${format(new Date(), 'yyyy-MM-dd')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };


  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.conversations) {
          const merge = window.confirm(
            'Nhấn OK để GỘP (Merge) vào lịch sử hiện tại, hoặc Cancel để THAY THẾ (Replace) toàn bộ.'
          );
          importHistory(json, merge ? 'merge' : 'replace');
        }
      } catch {
        alert('File backup không hợp lệ');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filtered = conversations
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return c.title.toLowerCase().includes(q) || c.messages.some((m) => m.text.toLowerCase().includes(q));
    })
    .sort((a, b) => (a.pinned === b.pinned ? b.updatedAt - a.updatedAt : a.pinned ? -1 : 1));

  return (
    <aside className="w-72 border-r border-border bg-surface flex flex-col h-full shrink-0">
      <div className="p-3.5 space-y-2.5 border-b border-border">
        <button
          onClick={() => createConversation()}
          className="w-full flex items-center justify-center gap-2 bg-primary text-background font-medium py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
        >
          <Plus size={17} />
          <span>Cuộc trò chuyện mới</span>
        </button>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm trong lịch sử chat..."
            className="w-full bg-background border border-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-primary placeholder:text-muted focus:outline-none focus:border-accent-terracotta"
          />
        </div>
      </div>

      <div className="px-3.5 pt-3 pb-1 flex items-center justify-between text-[11px] uppercase tracking-wider text-muted">
        <span>Lịch sử trên máy ({filtered.length})</span>
        <span className="text-accent-sage font-mono">Local</span>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-1">
        {filtered.map((conv) => (
          <div
            key={conv.id}
            className={cn(
              'flex items-center justify-between group px-3 py-2 rounded-xl cursor-pointer text-sm transition-colors border',
              activeConversationId === conv.id
                ? 'bg-background border-border text-primary'
                : 'border-transparent text-muted hover:bg-background/50 hover:text-primary'
            )}
            onClick={() => setActiveConversation(conv.id)}
          >
            <div className="flex items-center gap-2 overflow-hidden flex-1">
              <MessageSquare size={15} className={cn('shrink-0', conv.pinned ? 'text-accent-terracotta' : 'text-muted')} />
              <div className="truncate flex-1">
                <div className="truncate font-medium text-xs sm:text-sm">{conv.title}</div>
                <div className="text-[10px] text-muted">{conv.messages.length} tin • {format(conv.updatedAt, 'HH:mm dd/MM')}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
              <button onClick={(e) => { e.stopPropagation(); togglePinConversation(conv.id); }} className="p-1 hover:text-accent-terracotta" title="Ghim">
                <Pin size={13} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} className="p-1 hover:text-accent-terracotta" title="Xóa">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border bg-background/40 space-y-2">
        <button
          onClick={handleSaveSnapshot}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-surface border border-border hover:border-accent-sage text-xs font-medium text-primary transition-colors"
        >
          {savedToast ? (
            <>
              <Check size={14} className="text-accent-sage" />
              <span className="text-accent-sage">Đã lưu lịch sử vào máy!</span>
            </>
          ) : (
            <>
              <Save size={14} className="text-accent-terracotta" />
              <span>Lưu lịch sử chat</span>
            </>
          )}
        </button>

        <div className="grid grid-cols-3 gap-1.5">
          <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-surface border border-border text-[11px] text-muted hover:text-primary">
            <Upload size={12} /> Import
          </button>
          <button onClick={handleExport} className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-surface border border-border text-[11px] text-muted hover:text-primary">
            <Download size={12} /> Export
          </button>
          <button onClick={handleExportMarkdown} className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-surface border border-border text-[11px] text-muted hover:text-primary">
            <FileText size={12} /> .MD
          </button>
        </div>
      </div>
    </aside>
  );
}

