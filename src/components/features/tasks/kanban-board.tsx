'use client';

import { useEffect, useRef, useState } from 'react';
import {
  closestCorners,
  pointerWithin,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
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

/** Move a task (by id) into `status`, just before the card `overId` (or at the end). */
function moveCard(board: BoardColumns, taskId: string, status: TaskStatus, overId: string): BoardColumns {
  const from = findColumn(board, taskId);
  if (!from) return board;
  const task = board[from].find((t) => t.id === taskId)!;
  const next = { ...board, [from]: board[from].filter((t) => t.id !== taskId) };
  const target = next[status];
  const overIndex = target.findIndex((t) => t.id === overId);
  const index = overIndex === -1 ? target.length : overIndex;
  next[status] = [...target.slice(0, index), task, ...target.slice(index)];
  return next;
}

/**
 * Drop where the finger or mouse is. Falls back to the closest card for keyboard moves.
 * (Measuring the card's corners picked the wrong column on phones, where a card is as wide as a column.)
 */
const boardCollision: CollisionDetection = (args) => {
  const underPointer = pointerWithin(args);
  return underPointer.length > 0 ? underPointer : closestCorners(args);
};

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
  // Local copy of the board: cards move here while dragging, so the preview and
  // the drop animation show exactly where the card will land.
  const [board, setBoard] = useState<BoardColumns>(columns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const isDragging = useRef(false);

  // Follow the server data, except in the middle of a drag.
  useEffect(() => {
    if (!isDragging.current) setBoard(columns);
  }, [columns]);

  const sensors = useSensors(
    // Mouse: a small move starts the drag, so plain clicks still open the task.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Touch: press and hold, so a normal swipe still scrolls the columns.
    // (Separate mouse/touch sensors: a pointer sensor would grab touches without the hold.)
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    // Space picks up and drops; Enter is kept for opening the task.
    useSensor(KeyboardSensor, {
      coordinateGetter: boardKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space'] },
    }),
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    isDragging.current = true;
    setActiveTask(TASK_STATUSES.flatMap((s) => board[s.value]).find((t) => t.id === active.id) ?? null);
  };

  // Moving over another column: move the card there right away (live preview).
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const from = findColumn(board, String(active.id));
    const to = findColumn(board, String(over.id));
    if (!from || !to || from === to) return;
    setBoard((current) => moveCard(current, String(active.id), to, String(over.id)));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    isDragging.current = false;
    setActiveTask(null);
    const original = TASK_STATUSES.flatMap((s) => columns[s.value]).find((t) => t.id === active.id);
    const status = findColumn(board, String(active.id));
    if (!original || !status) return setBoard(columns);

    // Reordering inside the final column.
    let finalBoard = board;
    const column = board[status];
    const oldIndex = column.findIndex((t) => t.id === active.id);
    const newIndex = over ? column.findIndex((t) => t.id === over.id) : -1;
    if (newIndex !== -1 && newIndex !== oldIndex) {
      finalBoard = { ...board, [status]: arrayMove(column, oldIndex, newIndex) };
      setBoard(finalBoard);
    }

    // Tell the parent where it landed, unless nothing changed.
    const finalColumn = finalBoard[status];
    const afterId = finalColumn[finalColumn.findIndex((t) => t.id === active.id) - 1]?.id ?? null;
    const before = columns[original.status];
    const originalAfter = before[before.findIndex((t) => t.id === active.id) - 1]?.id ?? null;
    if (status === original.status && afterId === originalAfter) return;
    onMove(original, status, afterId);
  };

  const handleDragCancel = () => {
    isDragging.current = false;
    setActiveTask(null);
    setBoard(columns);
  };

  // Column the dragged card is in right now, highlighted as the drop target.
  const overStatus = activeTask ? findColumn(board, activeTask.id) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={boardCollision}
      // Gentle edge scrolling: on phones the default speed skipped whole columns.
      autoScroll={{ acceleration: 4, threshold: { x: 0.12, y: 0.15 } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* Phones: swipe between columns. Desktop: all four side by side. */}
      {/* Snapping is off while dragging: with it on, every small edge-scroll jumped a whole column. */}
      <div
        className={cn(
          '-mx-4 flex scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:scroll-px-0 md:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible',
          activeTask ? 'snap-none' : 'snap-x snap-mandatory',
        )}
      >
        {TASK_STATUSES.map((status) => (
          <BoardColumn
            key={status.value}
            status={status.value}
            label={status.label}
            color={status.color}
            tasks={board[status.value]}
            isDropTarget={overStatus === status.value}
            onOpen={onOpen}
            canMove={canMove}
            onQuickAdd={onQuickAdd}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}>
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
      // Explain why some cards can't be dragged.
      title={disabled ? 'Only the assignee, the creator or an admin can move this task' : undefined}
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
