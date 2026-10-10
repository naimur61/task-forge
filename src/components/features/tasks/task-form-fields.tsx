'use client';

import type { UseFormReturn } from 'react-hook-form';
import { CustomField } from '@/components/common/fields/cus-input-field';
import type { TaskFormData } from '@/components/common/forms/schemas/task';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/config/task';
import type { Member } from '@/types/member';
import type { Label } from '@/types/task';

interface TaskFormFieldsProps {
  form: UseFormReturn<TaskFormData>;
  members: Member[];
  labels: Label[];
  /** Read-only view for people who can't edit this task. */
  readOnly?: boolean;
}

const STATUS_OPTIONS = TASK_STATUSES.map((s) => ({ value: s.value, label: s.label }));
const PRIORITY_OPTIONS = TASK_PRIORITIES.map((p) => ({ value: p.value, label: p.label }));

/** All task inputs. Used by the create dialog and the task drawer. */
export function TaskFormFields({ form, members, labels, readOnly = false }: TaskFormFieldsProps) {
  const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({ value: m.user.id, label: m.user.name })),
  ];
  const labelOptions = labels.map((l) => ({ value: l.id, label: l.name }));

  return (
    <div className="space-y-4">
      <CustomField.Text form={form} name="title" labelName="Title" placeholder="What needs to be done?" required viewOnly={readOnly} disableLabelFormatting />
      <CustomField.TextArea
        form={form}
        name="description"
        labelName="Description"
        placeholder="Add details, links or acceptance criteria"
        rows={4}
        viewOnly={readOnly}
        disableLabelFormatting
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <CustomField.SelectField form={form} name="status" labelName="Status" options={STATUS_OPTIONS} showSearch={false} clearable={false} viewOnly={readOnly} />
        <CustomField.SelectField form={form} name="priority" labelName="Priority" options={PRIORITY_OPTIONS} showSearch={false} clearable={false} viewOnly={readOnly} />
        <CustomField.SelectField form={form} name="assigneeId" labelName="Assignee" options={assigneeOptions} placeholder="Unassigned" clearable={false} viewOnly={readOnly} />
        <CustomField.DatePickerField form={form} name="dueDate" labelName="Due date" viewOnly={readOnly} disableLabelFormatting />
      </div>
      {labelOptions.length > 0 && (
        <CustomField.SelectField
          form={form}
          name="labelIds"
          labelName="Labels"
          type="multiple"
          options={labelOptions}
          placeholder="Add labels"
          showSearch={false}
          viewOnly={readOnly}
        />
      )}
    </div>
  );
}
