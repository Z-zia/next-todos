import { NextRequest, NextResponse } from "next/server";
import { todoDb } from "@/server/db";
import { Todo } from "@/types/todo";

export async function POST(request: NextRequest) {
  try {
    const todo: Todo = await request.json();

    // 既存のTodoをチェック
    const existing = todoDb.getById(todo.id);

    if (existing) {
      // 既存の場合は更新
      todoDb.update(todo.id, {
        title: todo.title,
        priority: todo.priority,
        description: todo.description,
        completed: todo.completed
      });
    } else {
      // 新規の場合は追加
      todoDb.addTodo(todo);
    }

    return NextResponse.json({ success: true, todo });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to sync todo" },
      { status: 500 }
    );
  }
}