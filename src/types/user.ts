/** The signed-in user. */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}
