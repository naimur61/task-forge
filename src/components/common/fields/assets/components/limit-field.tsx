'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SingleSelectField } from './single-select-field';

interface LimitFieldProps {
  setLimit: (limit: string) => void;
  options?: string[];
  totalItems?: number;
  setCurrentPage?: (data: number) => void;
  placeholder?: string;
}

/**
 * LimitField — Dropdown for selecting items per page.
 * Syncs with URL query param `pageSize`. Resets to page 1 on change.
 */
export const LimitField = ({
  setLimit,
  options,
  totalItems = 100,
  setCurrentPage,
  placeholder = 'Entries per page',
}: LimitFieldProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const defaultOptions = ['10', '20', '30', '40', '50', '100'];
  const baseOptions = options ?? defaultOptions;

  // Only show options up to the total items count
  const lastIndex = baseOptions.findIndex((opt) => Number(opt) >= totalItems);
  const OptionsList = lastIndex === -1 ? baseOptions : baseOptions.slice(0, lastIndex + 1);

  const currentLimit = searchParams.get('pageSize') || '10';

  const handleLimitChange = (newLimit: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('pageSize', newLimit);
    params.set('page', '1'); // reset to first page
    router.push(`${pathname}?${params.toString()}`);

    setLimit(newLimit);
    setCurrentPage?.(1);
  };

  useEffect(() => {
    setLimit(currentLimit);
  }, [currentLimit, setLimit]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <SingleSelectField
            name="limit"
            placeholder={placeholder}
            options={OptionsList}
            onValueChange={handleLimitChange}
            defaultValue={currentLimit}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent className="bg-muted-foreground text-primary-foreground">
        <p className="text-[10px]">Number of entries per page</p>
      </TooltipContent>
    </Tooltip>
  );
};
