'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSidebar } from '@/contexts/SidebarContext';
import { useExaChat } from '@/contexts/ExaChatContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Image from 'next/image';
import ExaMarkdown from '@/components/ExaMarkdown/ExaMarkdown';

function ExaPageInner() {
  const { isOpen: sidebarOpen } = useSidebar();
  const {
    activeSessionId,
    activeSession,
    createSession,
    setActiveSession,
    addMessage,
    updateLastAssistantMessage,
    getSessionMessages,
    sessionExists,
  } = useExaChat();

  const searchParams = useSearchParams();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // URL'den chat session ID oku — session yoksa URL'i temizle
  useEffect(() => {
    const chatId = searchParams.get('chat');
    if (chatId) {
      if (sessionExists(chatId)) {
        setActiveSession(chatId);
      } else {
        // Olmayan session — URL'i temizle
        router.replace('/exa');
        setActiveSession(null);
      }
    }
  }, [searchParams, setActiveSession, sessionExists, router]);

  // Scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  // Mesaj gönder
  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();

    // Session yoksa VEYA mevcut session bulunamıyorsa yeni oluştur
    let sessionId = activeSessionId;
    if (!sessionId || !sessionExists(sessionId)) {
      sessionId = createSession('Türkiye geneli', 'exa');
    }

    addMessage(sessionId, { role: 'user', content: userMsg });
    setInput('');
    setLoading(true);

    // Önceki isteği iptal et
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    // 60 saniye timeout
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      // Güncel mesajları context'ten al (stale closure önlemi)
      const currentMessages = getSessionMessages(sessionId);
      const allMessages = [...currentMessages, { role: 'user' as const, content: userMsg }];

      const res = await fetch('/api/exa-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          context: activeSession?.context || 'Türkiye geneli',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`API hatası: ${res.status}`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Stream okunamadı');

      // Boş asistan mesajı ekle
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
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          const data = trimmed.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.content) {
              accumulated += parsed.content;
              updateLastAssistantMessage(sessionId, accumulated);
            }
          } catch { /* JSON parse hatası, devam et */ }
        }
      }

      // Eğer hiç içerik gelmediyse
      if (!accumulated) {
        updateLastAssistantMessage(sessionId, 'Yanıt alınamadı. Lütfen tekrar deneyin. 🔄');
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isAbort = err?.name === 'AbortError';
      const errorMsg = isAbort
        ? 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin. ⏱️'
        : 'Bağlantı hatası. Lütfen tekrar deneyin. 🔄';
      addMessage(sessionId, { role: 'assistant', content: errorMsg });
      setLoading(false);
    }
  }, [input, loading, activeSessionId, activeSession?.context, createSession, addMessage, updateLastAssistantMessage, getSessionMessages, sessionExists]);

  // Yeni sohbet
  const handleNewChat = () => {
    const id = createSession('Türkiye geneli', 'exa');
    setActiveSession(id);
    setInput('');
    inputRef.current?.focus();
  };

  const messages = activeSession?.messages || [];

  return (
    <div className="fixed inset-0 bg-black">
      {/* Exa markdown stilleri */}
      <style jsx global>{`
        .exa-markdown { overflow-x: hidden; max-width: 100%; }
        .exa-markdown p { margin: 0.3em 0; }
        .exa-markdown strong { color: #fff; font-weight: 600; }
        .exa-markdown em { color: rgba(255,255,255,0.7); font-style: italic; }
        .exa-markdown ul, .exa-markdown ol { margin: 0.5em 0; padding-left: 1.4em; }
        .exa-markdown li { margin: 0.2em 0; }
        .exa-markdown li::marker { color: rgba(59,130,246,0.7); }
        .exa-markdown h1, .exa-markdown h2, .exa-markdown h3 { color: #fff; font-weight: 700; margin: 0.6em 0 0.3em; }
        .exa-markdown h1 { font-size: 1.2em; }
        .exa-markdown h2 { font-size: 1.1em; }
        .exa-markdown h3 { font-size: 1.05em; }
        .exa-markdown code { background: rgba(255,255,255,0.08); padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; color: #93c5fd; word-break: break-all; overflow-wrap: break-word; }
        .exa-markdown pre { max-width: 100%; overflow-x: auto; }
        .exa-markdown blockquote { border-left: 2px solid rgba(59,130,246,0.4); padding-left: 0.75em; margin: 0.5em 0; color: rgba(255,255,255,0.6); }
        .exa-markdown a { color: #60a5fa; text-decoration: underline; }
        .exa-markdown hr { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 0.6em 0; }
      `}</style>

      <div 
        className="h-full flex flex-col transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '310px' : '100px' }}
      >
        {/* Chat Alanı */}
        <div className="flex-1 flex flex-col h-full min-w-0">
          {/* Mesajlar */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <Image
                    src="/icons/emlaxai-icon.svg"
                    alt="Exa"
                    width={64}
                    height={64}
                    style={{ objectFit: 'contain', opacity: 0.2 }}
                  />
                  <h2 className="text-white/40 text-lg font-medium mt-4">Merhaba, ben Exa</h2>
                  <p className="text-white/20 text-sm mt-1 max-w-md">
                    Türkiye emlak piyasası hakkında her şeyi sorabilirsiniz. Fiyat trendleri, yatırım analizi, bölge karşılaştırması ve daha fazlası.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-6 justify-center max-w-lg">
                    {[
                      'İstanbul\'da m² fiyat trendi nasıl?',
                      'En çok değerlenen 5 il hangisi?',
                      'Kira getirisi en yüksek iller?',
                      '2026 konut piyasası beklentileri?',
                      'Yatırım için hangi şehir?',
                      'Ticari vs konut yatırımı?',
                    ].map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInput(q)}
                        className="px-3.5 py-2 rounded-xl text-xs text-white/40 border border-white/8 hover:border-white/20 hover:text-white/60 hover:bg-white/3 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`${msg.role === 'user' ? 'flex justify-end' : 'overflow-hidden'}`}>
                  {msg.role === 'user' ? (
                    <div className="max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed bg-blue-500/15 text-white border border-blue-500/15">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="w-full text-sm leading-relaxed text-white/85 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Image src="/icons/emlaxai-icon.svg" alt="Exa" width={16} height={16} style={{ objectFit: 'contain' }} />
                        <span className="text-[11px] text-white/40 font-medium">Exa</span>
                      </div>
                      <ExaMarkdown>{msg.content}</ExaMarkdown>
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2">
                    <Image src="/icons/emlaxai-icon.svg" alt="Exa" width={16} height={16} style={{ objectFit: 'contain', opacity: 0.5 }} />
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-white/25 text-xs">Exa düşünüyor...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="px-6 pb-6 pt-2">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Emlak hakkında bir şey sorun..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-14 py-3.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:scale-110"
                >
                  <Image
                    src="/icons/send-prompt.svg"
                    alt="Gönder"
                    width={30}
                    height={30}
                    style={{ objectFit: 'contain' }}
                  />
                </button>
              </div>
              <p className="text-white/40 text-[11px] text-center mt-2.5">
                Bir yapay zeka sohbet robotu olan Exa&apos;ya ileti göndererek Şartlarımızı kabul etmiş ve Gizlilik Politikamızı okumuş olursun.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ExaPageInner />
    </Suspense>
  );
}
