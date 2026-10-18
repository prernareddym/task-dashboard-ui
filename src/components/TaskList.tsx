import type { Task, TaskStatus } from '../api/types';
import { PRIORITY_LABELS, STATUS_LABELS } from './TaskFilters';

interface Props {
  tasks: Task[];
  loading: boolean;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskList({ tasks, loading, onStatusChange, onEdit, onDelete }: Props) {
  if (!loading && tasks.length === 0) {
    return <p className="card empty">No tasks match. Create one with “New task”.</p>;
  }

  return (
    <ul className="task-list" aria-busy={loading}>
      {tasks.map((task) => (
        <li key={task.id} className="card task">
          <div className="task-main">
            <span className="task-title">{task.title}</span>
            {task.description && <span className="muted task-desc">{task.description}</span>}
            <span className="task-meta">
              <span className={`badge priority-${task.priority.toLowerCase()}`}>{PRIORITY_LABELS[task.priority]}</span>
              {task.dueDate && <span className="muted">Due {task.dueDate}</span>}
            </span>
          </div>
          <div className="task-actions">
            <select
              aria-label={`Status of ${task.title}`}
              value={task.status}
              onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}>
              Edit
            </button>
            <button type="button" className="danger" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`}>
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
