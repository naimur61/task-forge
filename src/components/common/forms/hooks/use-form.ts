import { useForm, type FieldValues, type UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

/**
 * react-hook-form + zod in one call. Input and output types are inferred from
 * the schema, so `.transform()` / `.default()` results reach `handleSubmit`.
 *
 * @example
 * const form = useZodForm(loginSchema, { defaultValues: { email: '', password: '' } });
 * <form onSubmit={form.handleSubmit((values) => login(values))}>…</form>
 */
export function useZodForm<TInput extends FieldValues, TOutput extends FieldValues = TInput>(
  schema: z.ZodType<TOutput, TInput>,
  options?: Omit<UseFormProps<TInput, unknown, TOutput>, 'resolver'>,
) {
  return useForm<TInput, unknown, TOutput>({
    resolver: zodResolver(schema),
    ...options,
  });
}
