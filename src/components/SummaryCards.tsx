import type { TaskSummary } from '../api/types';

export default function SummaryCards({ summary }: { summary: TaskSummary | null }) {
  const total = summary?.total ?? 0;
  const percent = (value: number) => (total === 0 ? 0 : Math.round((value / total) * 100));
  const cards = [
    { key: 'todo', label: 'To do', value: summary?.todo ?? 0 },
    { key: 'inProgress', label: 'In progress', value: summary?.inProgress ?? 0 },
    { key: 'done', label: 'Done', value: summary?.done ?? 0 },
  ] as const;

  return (
    <section aria-label="Summary" className="summary">
      {cards.map((card) => (
        <div key={card.key} className={`card stat stat-${card.key}`}>
          <span className="stat-label">{card.label}</span>
          <strong className="stat-value" data-testid={`stat-${card.key}`}>
            {card.value}
          </strong>
          <div className="bar" aria-hidden="true">
            <div className="bar-fill" style={{ width: `${percent(card.value)}%` }} />
          </div>
        </div>
      ))}
      <div className="card stat">
        <span className="stat-label">Total</span>
        <strong className="stat-value" data-testid="stat-total">
          {total}
        </strong>
      </div>
    </section>
  );
}
