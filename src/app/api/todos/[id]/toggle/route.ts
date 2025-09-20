import { NextRequest, NextResponse } from "next/server";
import { todoDb } from "@/server/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const todo = todoDb.toggle(params.id);

  if (!todo) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json(todo);
}