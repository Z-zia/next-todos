export interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface CreateTodoRequest {
  title: string;
  description?: string;
  priority: Priority;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: Priority;
}
