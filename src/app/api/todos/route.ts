import { NextRequest, NextResponse } from "next/server";
import { todoDb } from "@/server/db";
import { z } from "zod";

const createTodoSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

export async function GET() {
  const todos = todoDb.getAll();
  return NextResponse.json({ todos });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createTodoSchema.parse(body);

    const todo = todoDb.create(validated.title, validated.description);

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}