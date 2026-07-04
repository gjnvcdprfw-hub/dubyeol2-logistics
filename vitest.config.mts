import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  // 테스트 파일들이 같은 SQLite DB를 공유하므로 파일 병렬 실행을 끈다
  test: { environment: "node", include: ["tests/**/*.test.ts"], fileParallelism: false },
});
