import { Todo } from "@/types/todo";

let todos: Todo[] = [];

export const todoDb = {
  getAll(): Todo[] {
    return todos;
  },

  getById(id: string): Todo | undefined {
    return todos.find((todo) => todo.id === id);
  },

  create(title: string, description?: string): Todo {
    const todo: Todo = {
      id: Math.random().toString(36).substring(7),
      title,
      description,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    todos.push(todo);
    return todo;
  },

  update(id: string, updates: Partial<Omit<Todo, "id">>): Todo | undefined {
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) return undefined;

    todos[index] = {
      ...todos[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return todos[index];
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