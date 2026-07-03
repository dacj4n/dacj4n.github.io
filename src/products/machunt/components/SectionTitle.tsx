import { motion } from 'framer-motion';

interface SectionTitleProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
}

export default function SectionTitle({ label, title, description, className = '' }: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`text-center mb-16 md:mb-20 ${className}`}
    >
      {label && (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-block px-4 py-1.5 mb-6 text-xs font-medium tracking-wider uppercase rounded-full border"
          style={{
            borderColor: 'var(--badge-border)',
            backgroundColor: 'var(--badge-bg)',
            color: 'var(--badge-text)',
          }}
        >
          {label}
        </motion.span>
      )}
      <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-[var(--text-primary)] mb-6">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}
