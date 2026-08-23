import { forwardRef, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Bot, Send, X } from 'lucide-react';
import clsx from 'clsx';
import ChatMarkdown from './ChatMarkdown';
import { toggleChat, sendMessageThunk, addUserMessage } from '../../store/chatSlice';

function TypingIndicator() {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl rounded-bl-md bg-cream-100 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-brand-600 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

const MessageBubble = forwardRef(function MessageBubble({ message }, ref) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[80%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-sm text-white shadow-soft">
          {message.content}
        </p>
      </div>
    );
  }

  if (message.role === 'error') {
    return (
      <div className="flex justify-start">
        <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md bg-rose-50 px-4 py-2.5 text-sm text-rose-700 border border-rose-100">
          {message.content}
        </p>
      </div>
    );
  }

  return (
    <div ref={ref} className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-cream-100 px-4 py-2.5 text-sm text-ink-900">
        <ChatMarkdown>{message.content}</ChatMarkdown>
      </div>
    </div>
  );
});

export default function ChatWidget() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { open, messages, sending } = useSelector((s) => s.chat);
  const user = useSelector((s) => s.auth.user);
  const [text, setText] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const latestReplyRef = useRef(null);
  const nearBottomRef = useRef(true);

  const SUGGESTIONS = [
    t('chat.suggestion1'),
    t('chat.suggestion2'),
    t('chat.suggestion3'),
    t('chat.suggestion4'),
  ];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  }, [messages.length, sending, open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const last = messages[messages.length - 1];
    if (last?.role === 'assistant' && nearBottomRef.current && latestReplyRef.current) {
      el.scrollTop = latestReplyRef.current.offsetTop - el.offsetTop - 8;
      return;
    }
    if (nearBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length, sending, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!sending) {
      setElapsed(0);
      return;
    }
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [sending]);

  if (!user) return null;

  const submit = (e) => {
    e?.preventDefault?.();
    const value = text.trim();
    if (!value || sending) return;
    setText('');
    dispatch(addUserMessage(value));
    dispatch(sendMessageThunk(value));
  };

  return (
    <>
      <button
        onClick={() => dispatch(toggleChat())}
        aria-label={t('chat.open')}
        className={clsx(
          'fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full shadow-float transition-all duration-200 active:scale-95',
          open ? 'bg-ink-900 text-white' : 'bg-brand-600 text-white hover:bg-brand-700'
        )}
      >
        {open ? <X size={22} /> : <Bot size={24} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl bg-white shadow-float border border-cream-200 animate-zoom-in">
          <div className="flex items-center gap-3 bg-brand-gradient px-4 py-3.5 text-white">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20">
              <Bot size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold leading-tight">Travis AI</p>
              <p className="text-xs text-white/85">{t('chat.online')}</p>
            </div>
            <button onClick={() => dispatch(toggleChat())} aria-label={t('chat.close')} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/15 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4 bg-cream-gradient">
            {messages.length === 0 ? (
              <>
                <div className="flex justify-start">
                  <p className="max-w-[85%] rounded-2xl rounded-bl-md bg-cream-100 px-4 py-2.5 text-sm text-ink-900">
                    {t('chat.greeting', { name: user?.name?.split(' ')[0] || t('chat.there') })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        dispatch(addUserMessage(s));
                        dispatch(sendMessageThunk(s));
                      }}
                      disabled={sending}
                      className="chip hover:bg-cream-200 disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  ref={i === messages.length - 1 && m.role === 'assistant' ? latestReplyRef : undefined}
                  message={m}
                />
              ))
            )}

            {sending && (
              <div className="flex justify-start">
                <TypingIndicator />
              </div>
            )}

            {sending && elapsed > 8 && (
              <div className="flex justify-start">
                <p className="rounded-2xl rounded-bl-md bg-cream-50 px-3 py-2 text-xs text-ink-400">
                  {t('chat.stillWorking')}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-cream-200 bg-white px-3 py-3">
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="input !rounded-full flex-1"
              maxLength={4000}
              disabled={sending}
            />
            <button
              type="submit"
              aria-label={t('chat.send')}
              disabled={!text.trim() || sending}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 disabled:opacity-40 active:scale-95"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
