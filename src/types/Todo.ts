export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  /**
   * Optional due date stored as a date-only string in format YYYY-MM-DD.
   * Undefined means no due date set.
   */
  dueDate?: string;
}
