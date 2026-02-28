'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useExaChat } from '@/contexts/ExaChatContext';

interface UseExaChatPanelOptions {
  selectedIl: string | null;
  selectedParcel: any;
  imarBaskisi: boolean;
}

export function useExaChatPanel(options: UseExaChatPanelOptions) {
  const {
    sessions,
    activeSessionId,
    createSession,
    addMessage,
    updateLastAssistantMessage,
    getSessionMessages,
    sessionExists,
  } = useExaChat();

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickSessionId, setQuickSessionId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const messages = quickSessionId
    ? sessions.find((s) => s.id === quickSessionId)?.messages || []
    : [];

  useEffect(() => {
    if (!isOpen) setQuickSessionId(null);
  }, [isOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();

    let context = options.selectedIl
      ? `${options.selectedIl} bölgesi`
      : 'Türkiye geneli';

    if (options.imarBaskisi && options.selectedParcel) {
      const p = options.selectedParcel.parsel;
      const ib = options.selectedParcel.imar_baskisi;
      const ti = options.selectedParcel.tapu_islem;
      context += ` | İmar Modu Aktif | Seçili Parsel: Ada ${p.ada}/Parsel ${p.parsel}, ${p.mahalle} ${p.ilce}/${p.il}, Cins: ${p.cins}, Alan: ${Math.round(p.alan)} m², İmar Baskısı: ${ib.skor}/100 (${ib.seviye})`;
      if (ti) {
        context += ` | TKGM Tapu İşlem: ${ti.parsel_islem} işlem, Çevre ort: ${ti.cevre_ort}`;
      }
    }

    let sessionId = quickSessionId;
    if (!sessionId || !sessionExists(sessionId)) {
      sessionId = createSession(context, 'quick-analysis');
      setQuickSessionId(sessionId);
    }

    addMessage(sessionId, { role: 'user', content: userMsg });
    setInput('');
    setLoading(true);

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const currentMessages = getSessionMessages(sessionId);
      const allMessages = [
        ...currentMessages,
        { role: 'user' as const, content: userMsg },
      ];

      const res = await fetch('/api/exa-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages, context }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`API hatası: ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Stream okunamadı');

      addMessage(sessionId, { role: 'assistant', content: '' });
      setLoading(false);

      let accumulated = '';
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed?.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulated += parsed.content;
              updateLastAssistantMessage(sessionId, accumulated);
            }
          } catch {
            /* skip */
          }
        }
      }

      if (!accumulated) {
        updateLastAssistantMessage(sessionId, 'Yanıt alınamadı. Lütfen tekrar deneyin.');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const errorMsg =
        err?.name === 'AbortError'
          ? 'İstek zaman aşımına uğradı.'
          : 'Bağlantı hatası. Lütfen tekrar deneyin.';
      addMessage(sessionId, { role: 'assistant', content: errorMsg });
      setLoading(false);
    }
  }, [
    input,
    loading,
    quickSessionId,
    options,
    createSession,
    addMessage,
    updateLastAssistantMessage,
    getSessionMessages,
    sessionExists,
  ]);

  return {
    isOpen,
    setIsOpen,
    input,
    setInput,
    loading,
    messages,
    chatEndRef,
    sendMessage,
  };
}
