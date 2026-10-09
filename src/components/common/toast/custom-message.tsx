
/**
 * ToastMessageChange — Transform common error/response messages into
 * human-friendly text. Register known patterns here.
 */
export const ToastMessageChange = (message: string | any): string => {
  switch (message) {
    case `Prisma: Unique constraint failed on field "name"`:
      return 'Duplicate data found. Please change the title and try again.';
    case `Prisma: Unique constraint failed on field "courseType"`:
      return 'Duplicate data found. Please change the course type and try again.';
    case 'Course total credits is less than modules total credits':
      return 'Please ensure the assigned module credit is within the course credit.';
    default:
      return message;
  }
};
