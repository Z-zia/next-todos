import { create } from "zustand";
import { Todo } from "@/types/todo";
import axios from "axios";

interface TodoStore {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;

  fetchTodos: () => Promise<void>;
  addTodo: (title: string, description?: string) => Promise<Todo | null>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, title: string, description?: string) => Promise<void>;
  setTodos: (todos: Todo[]) => void;
  addTodoFromPeer: (todo: Todo) => void;
  deleteTodoFromPeer: (todoId: string) => void;
  toggleTodoFromPeer: (todo: Todo) => void;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  fetchTodos: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get("/api/todos");
      set({ todos: response.data.todos, isLoading: false });
    } catch (error) {
      set({ error: "Todoの取得に失敗しました", isLoading: false });
    }
  },

  addTodo: async (title: string, description?: string) => {
    set({ error: null });
    try {
      const response = await axios.post("/api/todos", { title, description });
      set((state) => ({
        todos: [...state.todos, response.data],
      }));
      return response.data; // 新しく追加したTodoを返す
    } catch (error) {
      set({ error: "Todoの追加に失敗しました" });
      return null;
    }
  },

  toggleTodo: async (id: string) => {
    set({ error: null });
    try {
      const response = await axios.post(`/api/todos/${id}/toggle`);
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? response.data : todo
        ),
      }));
    } catch (error) {
      set({ error: "Todoの更新に失敗しました" });
    }
  },

  deleteTodo: async (id: string) => {
    set({ error: null });
    try {
      await axios.delete(`/api/todos/${id}`);
      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
      }));
    } catch (error) {
      set({ error: "Todoの削除に失敗しました" });
    }
  },

  updateTodo: async (id: string, title: string, description?: string) => {
    set({ error: null });
    try {
      const response = await axios.put(`/api/todos/${id}`, { title, description });
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? response.data : todo
        ),
      }));
    } catch (error) {
      set({ error: "Todoの更新に失敗しました" });
    }
  },

  setTodos: (todos: Todo[]) => {
    set({ todos });
  },

  addTodoFromPeer: (todo: Todo) => {
    set((state) => {
      // 重複チェック
      if (state.todos.some((t) => t.id === todo.id)) {
        return state;
      }
      return { todos: [...state.todos, todo] };
    });
  },

  deleteTodoFromPeer: (todoId: string) => {
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== todoId),
    }));
  },

  toggleTodoFromPeer: (todo: Todo) => {
    set((state) => ({
      todos: state.todos.map((t) => (t.id === todo.id ? todo : t)),
    }));
  },
}));