'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

// ========================================================================
// Types
// ========================================================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  context?: string; // örn: "İstanbul bölgesi", "Türkiye geneli"
  source?: 'exa' | 'quick-analysis'; // nereden oluşturuldu
}

interface ExaChatContextType {
  sessions: ChatSession[];
  activeSessionId: string | null;
  activeSession: ChatSession | null;
  createSession: (context?: string, source?: 'exa' | 'quick-analysis') => string;
  setActiveSession: (id: string | null) => void;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateLastAssistantMessage: (sessionId: string, content: string) => void;
  setSessionTitle: (sessionId: string, title: string) => void;
  deleteSession: (sessionId: string) => void;
  getSessionMessages: (sessionId: string) => ChatMessage[];
  sessionExists: (sessionId: string) => boolean;
}

const ExaChatContext = createContext<ExaChatContextType | undefined>(undefined);

// ========================================================================
// localStorage helpers
// ========================================================================

const STORAGE_KEY = 'exa-chat-sessions';

function loadSessions(): ChatSession[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {}
}

// ========================================================================
// Provider
// ========================================================================

export function ExaChatProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // localStorage'dan yükle
  useEffect(() => {
    const stored = loadSessions();
    setSessions(stored);
    setLoaded(true);
  }, []);

  // localStorage'a kaydet
  useEffect(() => {
    if (loaded) {
      saveSessions(sessions);
    }
  }, [sessions, loaded]);

  // Aktif session
  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  // Yeni session oluştur
  const createSession = useCallback((context?: string, source?: 'exa' | 'quick-analysis') => {
    const id = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newSession: ChatSession = {
      id,
      title: 'Yeni Sohbet',
      messages: [],
      createdAt: Date.now(),
      context,
      source: source || 'exa',
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(id);
    return id;
  }, []);

  // Mesaj ekle
  const addMessage = useCallback((sessionId: string, message: ChatMessage) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const updated = { ...s, messages: [...s.messages, message] };
      // İlk kullanıcı mesajından otomatik başlık oluştur
      if (message.role === 'user' && s.title === 'Yeni Sohbet') {
        updated.title = message.content.length > 40 
          ? message.content.slice(0, 40) + '...' 
          : message.content;
      }
      return updated;
    }));
  }, []);

  // Son asistan mesajını güncelle (streaming için)
  const updateLastAssistantMessage = useCallback((sessionId: string, content: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      const msgs = [...s.messages];
      const lastIdx = msgs.length - 1;
      if (lastIdx >= 0 && msgs[lastIdx].role === 'assistant') {
        msgs[lastIdx] = { ...msgs[lastIdx], content };
      }
      return { ...s, messages: msgs };
    }));
  }, []);

  // Başlık güncelle
  const setSessionTitle = useCallback((sessionId: string, title: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, title } : s
    ));
  }, []);

  // Session sil
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
    }
  }, [activeSessionId]);

  // Session mesajlarını ref üzerinden al (stale closure önlemi)
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;

  const getSessionMessages = useCallback((sessionId: string): ChatMessage[] => {
    const session = sessionsRef.current.find(s => s.id === sessionId);
    return session?.messages || [];
  }, []);

  // Session var mı kontrolü (güncel ref üzerinden)
  const sessionExists = useCallback((sessionId: string): boolean => {
    return sessionsRef.current.some(s => s.id === sessionId);
  }, []);

  return (
    <ExaChatContext.Provider value={{
      sessions,
      activeSessionId,
      activeSession,
      createSession,
      setActiveSession: setActiveSessionId,
      addMessage,
      updateLastAssistantMessage,
      setSessionTitle,
      deleteSession,
      getSessionMessages,
      sessionExists,
    }}>
      {children}
    </ExaChatContext.Provider>
  );
}

export function useExaChat() {
  const context = useContext(ExaChatContext);
  if (!context) {
    throw new Error('useExaChat must be used within ExaChatProvider');
  }
  return context;
}
