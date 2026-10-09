'use client';

import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface DialogWrapperProps {
  style?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerContent?: ReactNode;
  title?: ReactNode;
  description?: string;
  children: ReactNode;
  closer?: boolean;
  footer?: ReactNode;
}

export function DialogWrapper({
  open, setOpen, triggerContent, title, description,
  children, closer = true, style, footer,
}: DialogWrapperProps) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerContent && <DialogTrigger asChild>{triggerContent}</DialogTrigger>}
      <DialogContent
        className={cn(
          'flex flex-col max-h-[90%] lg:max-h-[80%] overflow-hidden',
          style,
        )}
      >
        {closer && (
          <DialogClose asChild>
            <button className="cursor-pointer absolute top-3 right-3 rounded-sm opacity-70 hover:opacity-100 focus:outline-none z-10">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </button>
          </DialogClose>
        )}
        <DialogHeader
          className={cn(
            'shrink-0 capitalize bg-background',
            title || description ? 'py-3 px-2 border-b' : 'pt-2 bg-transparent',
          )}
        >
          <DialogTitle className={title ? 'block' : 'hidden'}>{title || ''}</DialogTitle>
          <DialogDescription className={description ? 'block' : 'hidden'}>{description || ''}</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        {footer && <DialogFooter className="border-t px-4 py-3">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
