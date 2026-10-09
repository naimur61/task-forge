'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { ActionButton } from '@/components/common/button';
import { UserAvatar } from '@/components/common/user-avatar/user-avatar';
import { Textarea } from '@/components/ui/textarea';
import { formatRelativeTime } from '@/lib/date-utils';
import type { Comment } from '@/types/task';

interface CommentThreadProps {
  comments: Comment[];
  isLoading: boolean;
  currentUserId: string;
  /** Owner/admin may delete anyone's comment. */
  canDeleteAny: boolean;
  onAdd: (body: string) => void;
  isAdding: boolean;
  onEdit: (commentId: string, body: string) => void;
  onDelete: (commentId: string) => void;
}

/** Task comments with an add box. Authors can edit their own comments. */
export function CommentThread({
  comments,
  isLoading,
  currentUserId,
  canDeleteAny,
  onAdd,
  isAdding,
  onEdit,
  onDelete,
}: CommentThreadProps) {
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const submit = () => {
    if (!draft.trim()) return;
    onAdd(draft.trim());
    setDraft('');
  };

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Comments {comments.length > 0 && `(${comments.length})`}</h3>

      {isLoading && <p className="text-sm text-muted-foreground">Loading comments…</p>}
      {!isLoading && comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet. Start the conversation.</p>}

      <ul className="space-y-4">
        {comments.map((comment) => {
          const isMine = comment.author.id === currentUserId;
          const isEditing = editingId === comment.id;
          return (
            <li key={comment.id} className="group flex gap-3">
              <UserAvatar user={comment.author} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-foreground">{comment.author.name}</span>
                  <span className="text-muted-foreground">{formatRelativeTime(comment.createdAt)}</span>
                  {comment.updatedAt !== comment.createdAt && <span className="text-muted-foreground">(edited)</span>}
                  <span className="ml-auto flex gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    {isMine && !isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditText(comment.body);
                        }}
                        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        aria-label="Edit comment"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    )}
                    {(isMine || canDeleteAny) && (
                      <button
                        type="button"
                        onClick={() => onDelete(comment.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label="Delete comment"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    )}
                  </span>
                </div>

                {isEditing ? (
                  <div className="mt-1.5 space-y-2">
                    <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2} aria-label="Edit comment" />
                    <div className="flex gap-2">
                      <ActionButton
                        size="sm"
                        disabled={!editText.trim()}
                        handleOpen={() => {
                          onEdit(comment.id, editText.trim());
                          setEditingId(null);
                        }}
                      >
                        Save
                      </ActionButton>
                      <ActionButton size="sm" variant="ghost" handleOpen={() => setEditingId(null)}>
                        Cancel
                      </ActionButton>
                    </div>
                  </div>
                ) : (
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-foreground">{comment.body}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="space-y-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Ctrl/Cmd + Enter sends the comment.
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit();
          }}
          placeholder="Write a comment…"
          rows={2}
          aria-label="New comment"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Ctrl + Enter to send</span>
          <ActionButton size="sm" isPending={isAdding} disabled={!draft.trim()} handleOpen={submit}>
            Comment
          </ActionButton>
        </div>
      </div>
    </section>
  );
}
