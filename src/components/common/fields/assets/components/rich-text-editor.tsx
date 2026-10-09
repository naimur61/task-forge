'use client';

import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useId, useRef, useState } from 'react';
import { Bold, Italic, List, Heading } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FieldLabel } from './field-label';

interface RichTextEditorProps {
  form?: any;
  name?: string;
  labelName?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  disableLabelFormatting?: boolean;
  customMessage?: React.ReactNode;
}

export const RichTextEditor = ({
  form, name = 'content', labelName, required = false, placeholder = 'Write something...',
  disabled = false, disableLabelFormatting = false, customMessage,
}: RichTextEditorProps) => {
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const wrapSelection = (tag: string) => {
    if (!form) return;
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const wrapped = tag === 'h1' ? `# ${selected}` :
      tag === 'h2' ? `## ${selected}` :
      tag === 'li' ? `- ${selected}` :
      tag === 'italic' ? `*${selected}*` :
      `**${selected}**`;

    const newText = text.substring(0, start) + wrapped + text.substring(end);
    form.setValue(name, newText, { shouldValidate: true });
    setActiveTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const editorButtons = [
    { tag: 'bold', icon: Bold, label: 'Bold' },
    { tag: 'italic', icon: Italic, label: 'Italic' },
    { tag: 'h1', icon: Heading, label: 'Heading' },
    { tag: 'li', icon: List, label: 'List' },
  ];

  if (!form) {
    return (
      <div className="space-y-2">
        <FieldLabel labelName={labelName} required={required} htmlFor={textareaId} disableLabelFormatting={disableLabelFormatting} />
        <Textarea id={textareaId} name={name} placeholder={placeholder} disabled={disabled} />
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name={name || 'content'}
      render={({ field }) => {
        const error = form.formState.errors?.[name || ''];
        return (
          <FormItem>
            <FieldLabel inForm labelName={labelName} required={required} disableLabelFormatting={disableLabelFormatting} />
            <div className="border rounded-md">
              <div role="toolbar" aria-label="Text formatting" className="flex items-center gap-1 p-2 border-b bg-muted/30">
                {editorButtons.map((btn) => (
                  <Button key={btn.tag} type="button" size="icon" variant="ghost" className={cn('h-8 w-8', activeTags.includes(btn.tag) && 'bg-accent')}
                    aria-label={btn.label} aria-pressed={activeTags.includes(btn.tag)} title={btn.label}
                    onClick={() => wrapSelection(btn.tag)} disabled={disabled}>
                    <btn.icon className="h-4 w-4" aria-hidden="true" />
                  </Button>
                ))}
              </div>
              <FormControl>
                <Textarea {...field} ref={(el) => { field.ref(el); textareaRef.current = el; }} value={field.value ?? ''} placeholder={placeholder} disabled={disabled}
                  className="min-h-[200px] border-0 focus-visible:ring-0 rounded-t-none font-mono text-sm" />
              </FormControl>
            </div>
            <FormMessage>{error ? String(error?.message || '') : customMessage || ''}</FormMessage>
          </FormItem>
        );
      }}
    />
  );
};
