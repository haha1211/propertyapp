import fs from "node:fs";
import dotenv from "dotenv";
import "@testing-library/jest-dom/vitest";

if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}
