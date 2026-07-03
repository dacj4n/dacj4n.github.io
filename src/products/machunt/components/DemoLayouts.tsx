import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionWrapper from './SectionWrapper';
import SectionTitle from './SectionTitle';
import type { LiveWorldConfig, CodeSnippet, StatCard } from '../config/config.types';

/* ── Conversation Mode (existing LiveWorld behavior, extracted here) ── */

export function DemoConversation({ config }: { config: LiveWorldConfig }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (!config.conversation) return;
    const max = config.conversation.length;
    if (visible >= max) return;
    const timer = setTimeout(() => setVisible((v) => v + 1), 800);
    return () => clearTimeout(timer);
  }, [visible, config.conversation]);

  return (
    <SectionWrapper id="live-world">
      <SectionTitle {...config.sectionTitle} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-10 max-w-3xl mx-auto"
      >
        {/* Event banner */}
        {config.eventLabel && (
          <div className="text-center mb-8">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-mono mb-3"
              style={{ backgroundColor: 'var(--badge-bg)', border: '1px solid var(--badge-border)', color: 'var(--badge-text)' }}
            >
              {config.eventLabel}
            </span>
            <h3 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {config.eventTitle}
            </h3>
          </div>
        )}

        {/* Agent status bar */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {config.agents?.map((a) => (
            <span
              key={a.name}
              className="px-3 py-1 rounded-full text-xs flex items-center gap-1.5"
              style={{ backgroundColor: 'var(--color-glass-bg)', border: '1px solid var(--color-glass-border)' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent-primary)' }} />
              <span style={{ color: a.color }}>{a.name}</span>
            </span>
          ))}
        </div>

        {/* Messages */}
        <div className="space-y-3">
          <AnimatePresence>
            {config.conversation?.slice(0, visible).map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                transition={{ duration: 0.4 }}
                className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className="max-w-[80%] rounded-2xl px-5 py-3"
                  style={{
                    backgroundColor: 'var(--color-glass-bg)',
                    border: '1px solid var(--color-glass-border)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{msg.emoji}</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>
                      {msg.agent}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {msg.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}

/* ── Code Preview Mode ── */

function CodeBlock({ snippet, index }: { snippet: CodeSnippet; index: number }) {
  const [lines, setLines] = useState(0);
  const codeLines = snippet.code.trim().split('\n');

  useEffect(() => {
    const timer = setTimeout(() => setLines((l) => Math.min(l + 1, codeLines.length)), 60);
    return () => clearTimeout(timer);
  }, [lines, codeLines.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.2 }}
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-glass-border)' }}
    >
      <div
        className="flex items-center justify-between px-4 py-2 text-xs"
        style={{ backgroundColor: 'var(--color-surface-3)' }}
      >
        <div className="flex gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ff5f57' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#febc2e' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#28c840' }} />
        </div>
        <span style={{ color: 'var(--text-muted)' }}>{snippet.title}.{snippet.language}</span>
      </div>
      <div className="p-5 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          <code>{codeLines.slice(0, lines).map((line, i) => (
            <div key={i} className="flex">
              <span className="w-8 text-right mr-4 opacity-30 select-none" style={{ color: 'var(--text-muted)' }}>
                {String(i + 1).padStart(2, ' ')}
              </span>
              {renderCodeLine(line)}
            </div>
          ))}</code>
        </pre>
        {lines < codeLines.length && (
          <span className="inline-block w-2 h-4 animate-pulse ml-8" style={{ backgroundColor: 'var(--accent-primary)' }} />
        )}
      </div>
    </motion.div>
  );
}

function renderCodeLine(line: string) {
  const parts = line.split(/(\/\/.*|\b(const|let|var|function|return|import|export|from|async|await|if|else|class|interface|type|extends|implements|new|try|catch|throw)\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g);
  const keywords = new Set(['const','let','var','function','return','import','export','from','async','await','if','else','class','interface','type','extends','implements','new','try','catch','throw']);
  return parts.map((part, i) => {
    if (!part) return <span key={i} />;
    if (part.startsWith('//')) return <span key={i} className="opacity-40 italic">{part}</span>;
    if (keywords.has(part)) return <span key={i} style={{ color: 'var(--accent-primary)' }}>{part}</span>;
    return <span key={i}>{part}</span>;
  });
}

export function DemoCodePreview({ config }: { config: LiveWorldConfig }) {
  return (
    <SectionWrapper id="live-world">
      <SectionTitle {...config.sectionTitle} />
      <div className="mt-10 max-w-4xl mx-auto grid gap-6">
        {config.codeSnippets?.map((s, i) => (
          <CodeBlock key={s.title} snippet={s} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}

/* ── Stat Cards Mode ── */

function AnimatedStat({ stat, index }: { stat: StatCard; index: number }) {
  const [count, setCount] = useState(0);
  const final = parseInt(stat.value.replace(/[^0-9]/g, '')) || 0;

  useEffect(() => {
    if (final === 0) { setCount(0); return; }
    const duration = 1500;
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += Math.ceil(final / steps);
      if (current >= final) { setCount(final); clearInterval(timer); }
      else setCount(current);
    }, stepTime);
    return () => clearInterval(timer);
  }, [final]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, type: 'spring' }}
      className="rounded-2xl p-8 text-center"
      style={{ backgroundColor: 'var(--color-glass-bg)', border: '1px solid var(--color-glass-border)' }}
    >
      <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
        {stat.prefix}{count.toLocaleString()}{stat.suffix || stat.value.replace(/[0-9,]/g, '')}
      </div>
      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
        {stat.label}
      </div>
    </motion.div>
  );
}

export function DemoStatCards({ config }: { config: LiveWorldConfig }) {
  return (
    <SectionWrapper id="live-world">
      <SectionTitle {...config.sectionTitle} />
      <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {config.stats?.map((s, i) => (
          <AnimatedStat key={s.label} stat={s} index={i} />
        ))}
      </div>
    </SectionWrapper>
  );
}

/* ── Before/After Mode ── */

export function DemoBeforeAfter({ config }: { config: LiveWorldConfig }) {
  return (
    <SectionWrapper id="live-world">
      <SectionTitle {...config.sectionTitle} />
      <div className="mt-10 max-w-4xl mx-auto space-y-8">
        {config.comparisons?.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Before */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-glass-border)' }}
            >
              <span
                className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-mono"
                style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
              >
                BEFORE
              </span>
              <p className="mt-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {c.before}
              </p>
            </div>
            {/* After */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{ backgroundColor: 'var(--color-glass-bg)', border: '1px solid var(--accent-primary)' }}
            >
              <span
                className="absolute top-3 left-3 px-2 py-0.5 rounded text-xs font-mono"
                style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}
              >
                AFTER
              </span>
              <p className="mt-4 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {c.after}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
