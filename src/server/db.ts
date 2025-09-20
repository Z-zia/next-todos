import { Todo } from "@/types/todo";
import { Priority } from "@/types/todo";

let todos: Todo[] = [];

export const todoDb = {
  addTodo(todo: Todo): void {
    todos.push(todo);
  },

  getAll(): Todo[] {
    return todos;
  },

  getById(id: string): Todo | undefined {
    return todos.find((todo) => todo.id === id);
  },

  create(title: string, priority: Priority, description?: string): Todo {
    const todo: Todo = {
      id: Math.random().toString(36).substring(7),
      title,
      description,
      priority: priority,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    todos.push(todo);
    return todo;
  },

  update(id: string, updates: { title?: string; priority?: Priority; description?: string; completed?: boolean }): Todo | undefined {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return undefined;

    if (updates.title !== undefined) todo.title = updates.title;
    if (updates.priority !== undefined) todo.priority = updates.priority;
    if (updates.description !== undefined) todo.description = updates.description;
    if (updates.completed !== undefined) todo.completed = updates.completed;
    todo.updatedAt = new Date().toISOString();
    return todo;
  },

  delete(id: string): boolean {
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) return false;

    todos.splice(index, 1);
    return true;
  },

  toggle(id: string): Todo | undefined {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return undefined;

    todo.completed = !todo.completed;
    todo.updatedAt = new Date().toISOString();
    return todo;
  },
};