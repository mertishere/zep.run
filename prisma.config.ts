import 'dotenv/config'
import type { PrismaConfig } from "prisma";
export default {
  schema: "backend/utils/db/schema.prisma",
} satisfies PrismaConfig;