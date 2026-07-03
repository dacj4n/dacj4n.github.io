import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getIcon } from '../config/icon-map';
import SectionWrapper from './SectionWrapper';
import SectionTitle from './SectionTitle';
import type { LiveWorldConfig } from '../config/config.types';

interface Props {
  config: LiveWorldConfig;
}

export default function LiveWorld({ config }: Props) {
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [eventPulse, setEventPulse] = useState(true);
  const RadioIcon = getIcon('Radio');

  useEffect(() => {
    config.conversation?.forEach((msg) => {
      setTimeout(() => {
        setVisibleMessages((prev) => [...prev, msg.id]);
      }, msg.delay * 1000);
    });
  }, [config.conversation]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEventPulse((v) => !v);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper id="live-world">
      <SectionTitle
        label={config.sectionTitle.label}
        title={config.sectionTitle.title}
        description={config.sectionTitle.description}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="glass-card overflow-hidden max-w-4xl mx-auto"
      >
        {/* World Event Banner */}
        <div className="border-b border-white/[0.04] px-6 py-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: eventPulse ? 1 : 0.95, opacity: eventPulse ? 1 : 0.6 }}
              transition={{ duration: 1 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center"
            >
              <RadioIcon className="w-4 h-4 text-amber-400" />
            </motion.div>
            <div>
              <div className="flex items-center gap-2">
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs font-medium text-amber-400 uppercase tracking-wider"
                >
                  {config.eventLabel}
                </motion.span>
                <div className="h-3 w-px bg-white/[0.08]" />
                <span className="text-xs text-gray-500 font-mono">LIVE</span>
              </div>
              <p className="text-sm text-[var(--text-primary)] font-medium">
                {config.eventTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Agent Status Bar */}
        <div className="border-b border-white/[0.04] px-6 py-3 overflow-x-auto">
          <div className="flex items-center gap-4 min-w-max">
            {config.agents?.map((agent) => (
              <div key={agent.name} className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className={`text-xs font-medium ${agent.color}`}>{agent.name}</span>
                <span className="text-[10px] text-gray-600">{agent.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="px-6 py-4 space-y-4 max-h-[500px] overflow-y-auto">
          <AnimatePresence>
            {config.conversation?.map((msg) => {
              const isVisible = visibleMessages.includes(msg.id);
              if (!isVisible) return null;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 16, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center shrink-0 text-sm">
                    {msg.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-[var(--text-primary)]">
                        {msg.agent}
                      </span>
                      <span className="text-[10px] text-gray-600 font-mono">
                        just now
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 16, duration: 0.5 }}
            className="flex items-center gap-2 pl-11"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2, 0.8, 0.2], y: [0, -3, 0] }}
                  transition={{ delay: i * 0.15, duration: 1.2, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-gray-500"
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">Multiple agents thinking...</span>
          </motion.div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
