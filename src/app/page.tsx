import { TodoPageClient } from "./todo-page-client";
import { todoDb } from "@/server/db";

export default async function HomePage() {
  const initialTodos = todoDb.getAll();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            リアルタイムTodoアプリ
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            WebRTCを使った同期機能付き
          </p>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <TodoPageClient initialTodos={initialTodos} />
      </main>
    </div>
  );
}