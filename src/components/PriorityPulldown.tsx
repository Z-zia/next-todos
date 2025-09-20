'use client';

import { Priority } from "@/types/todo";

interface PriorityProps {
  priority: Priority;
  onChange: (priority: Priority) => void;
}

export function PriorityPulldown({ priority, onChange }: PriorityProps) {
  const priorityLevels: readonly Priority[] = ["low", "medium", "high"];

  return (
    <div className="flex space-x-2">
      {priorityLevels.map((level) => (
        <button
          key={level}
          type="button"
          onClick={() => onChange(level)}
          className={`px-3 py-1 rounded-full text-sm font-medium focus:outline-none ${
            priority === level
              ? level === "low"
                ? "bg-green-500 text-white"
                : level === "medium"
                ? "bg-yellow-500 text-white"
                : "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  );
}
