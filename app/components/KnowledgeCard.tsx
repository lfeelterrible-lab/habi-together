import type { ReactNode } from 'react';

type KnowledgeCardProps = {
  label?: string;
  title: string;
  children: ReactNode;
  tone?: 'blue' | 'green' | 'orange' | 'ink';
  className?: string;
};

export default function KnowledgeCard({ label, title, children, tone = 'blue', className = '' }: KnowledgeCardProps) {
  return (
    <article className={`knowledge-card knowledge-card--${tone} ${className}`}>
      {label ? <p className="card-label">{label}</p> : null}
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </article>
  );
}
