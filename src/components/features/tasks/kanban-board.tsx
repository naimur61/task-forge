'use client';

import { useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus } from 'lucide-react';
import { TASK_STATUSES } from '@/config/task';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './task-card';

export type BoardColumns = Record<TaskStatus, Task[]>;

interface KanbanBoardProps {
  columns: BoardColumns;
  onOpen: (task: Task) => void;
  /** Whether the current user may move this task. */
  canMove: (task: Task) => boolean;
  /** Called when a card is dropped. `afterId` is the card it now sits under (null = top). */
  onMove: (task: Task, status: TaskStatus, afterId: string | null) => void;
  /** Shows a "+" in each column header. */
  onQuickAdd?: (status: TaskStatus) => void;
}

/** Find which column a task id or column id belongs to. */
function findColumn(columns: BoardColumns, id: string): TaskStatus | undefined {
  if (id in columns) return id as TaskStatus;
  return TASK_STATUSES.find((s) => columns[s.value].some((t) => t.id === id))?.value;
}

/**
 * Work out where a dropped card should go.
 * Dropping on a card puts it in that card's place; dropping on empty column space puts it last.
 */
function dropTarget(columns: BoardColumns, activeId: string, overId: string) {
  const status = findColumn(columns, overId);
  if (!status) return null;
  const column = columns[status];
  const others = column.filter((t) => t.id !== activeId);

  // Dropped on the column itself → end of the list.
  if (overId === status) return { status, afterId: others.at(-1)?.id ?? null };

  const overIndex = column.findIndex((t) => t.id === overId);
  const activeIndex = column.findIndex((t) => t.id === activeId);
  // Moving down inside the same column lands below the target, otherwise above it.
  const placeBelow = activeIndex !== -1 && activeIndex < overIndex;
  const indexInOthers = others.findIndex((t) => t.id === overId) + (placeBelow ? 1 : 0);
  return { status, afterId: indexInOthers > 0 ? others[indexInOthers - 1].id : null };
}

/**
 * Keyboard moves: Left/Right jump to the next column, Up/Down move inside the column.
 */
const boardKeyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
  const { active, droppableRects, collisionRect } = args.context;
  if ((event.code === 'ArrowLeft' || event.code === 'ArrowRight') && active && collisionRect) {
    const statuses = TASK_STATUSES.map((s) => s.value);
    const from = statuses.indexOf(active.data.current?.sortable?.containerId as TaskStatus);
    const to = statuses[from + (event.code === 'ArrowRight' ? 1 : -1)];
    const rect = to ? droppableRects.get(to) : undefined;
    if (!rect) return undefined;
    event.preventDefault();
    // Put the card at the top-left of the next column's list.
    return { x: rect.left + 4, y: rect.top + 4 };
  }
  return sortableKeyboardCoordinates(event, args);
};

/** Kanban board: one column per status, drag cards with mouse, touch or keyboard. */
export function KanbanBoard({ columns, onOpen, canMove, onMove, onQuickAdd }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  // Column under the dragged card, highlighted as the drop target.
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);

  const sensors = useSensors(
    // A small move is needed before dragging starts, so plain clicks still open the task.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    // Space picks up and drops; Enter is kept for opening the task.
    useSensor(KeyboardSensor, {
      coordinateGetter: boardKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space'] },
    }),
  );

  const allTasks = TASK_STATUSES.flatMap((s) => columns[s.value]);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTask(allTasks.find((t) => t.id === active.id) ?? null);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverStatus(over ? (findColumn(columns, String(over.id)) ?? null) : null);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveTask(null);
    setOverStatus(null);
    const task = allTasks.find((t) => t.id === active.id);
    if (!task || !over || active.id === over.id) return;
    const target = dropTarget(columns, String(active.id), String(over.id));
    if (!target) return;
    // Skip drops that don't change anything.
    const column = columns[task.status];
    const currentAfter = column[column.findIndex((t) => t.id === task.id) - 1]?.id ?? null;
    if (target.status === task.status && target.afterId === currentAfter) return;
    onMove(task, target.status, target.afterId);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveTask(null);
        setOverStatus(null);
      }}
    >
      {/* Phones: swipe between columns. Desktop: all four side by side. */}
      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:scroll-px-0 md:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {TASK_STATUSES.map((status) => (
          <BoardColumn
            key={status.value}
            status={status.value}
            label={status.label}
            color={status.color}
            tasks={columns[status.value]}
            isDropTarget={overStatus === status.value}
            onOpen={onOpen}
            canMove={canMove}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 180 }}>
        {activeTask && <TaskCard task={activeTask} isDragging className="cursor-grabbing" />}
      </DragOverlay>
    </DndContext>
  );
}

interface BoardColumnProps {
  status: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
  /** A card is being dragged over this column. */
  isDropTarget: boolean;
  onOpen: (task: Task) => void;
  canMove: (task: Task) => boolean;
  onQuickAdd?: (status: TaskStatus) => void;
}

/** One status column. The whole column is a drop zone. */
function BoardColumn({ status, label, color, tasks, isDropTarget, onOpen, canMove, onQuickAdd }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({ id: status });

  return (
    <section
      aria-label={`${label} column`}
      className="flex w-[82vw] max-w-sm shrink-0 snap-start flex-col rounded-xl bg-muted/60 p-2 sm:w-72 lg:w-auto lg:max-w-none"
    >
      <header className="flex items-center justify-between px-2 py-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} aria-hidden />
          {label}
          <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
            {tasks.length}
          </span>
        </h2>
        {onQuickAdd && (
          <button
            type="button"
            onClick={() => onQuickAdd(status)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-background hover:text-foreground"
            aria-label={`Add task to ${label}`}
          >
            <Plus className="h-4 w-4" aria-hidden />
          </button>
        )}
      </header>

      <SortableContext id={status} items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul
          ref={setNodeRef}
          className={cn(
            'flex min-h-32 flex-1 flex-col gap-2 rounded-lg p-1 transition-colors',
            isDropTarget && 'bg-primary/5 ring-2 ring-inset ring-primary/30',
          )}
        >
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} onOpen={onOpen} disabled={!canMove(task)} />
          ))}
          {tasks.length === 0 && (
            <li className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-border py-8 text-xs text-muted-foreground">
              No tasks yet
            </li>
          )}
        </ul>
      </SortableContext>
    </section>
  );
}

/** A card that can be dragged (unless `disabled`) and clicked to open. */
function SortableCard({ task, onOpen, disabled }: { task: Task; onOpen: (task: Task) => void; disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, disabled });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      onKeyDown={(e) => {
        // Enter opens the task; Space is used by the keyboard sensor to pick it up.
        if (e.key === 'Enter') onOpen(task);
        listeners?.onKeyDown?.(e);
      }}
      aria-label={`${task.title}${disabled ? '' : ', press space to move'}`}
      className={cn(
        'touch-manipulation rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        disabled ? 'cursor-pointer' : 'cursor-grab',
        isDragging && 'opacity-40',
      )}
    >
      <TaskCard task={task} />
    </li>
  );
}
