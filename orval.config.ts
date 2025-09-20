import { defineConfig } from "orval";

export default defineConfig({
  todos: {
    input: {
      target: "./src/api/openapi.yaml",
    },
    output: {
      mode: "split",
      target: "./src/services/generated/todos.ts",
      schemas: "./src/services/generated/model",
      client: "react-query",
      override: {
        mutator: {
          path: "./src/services/api-client.ts",
          name: "customAxios",
        },
      },
    },
  },
});