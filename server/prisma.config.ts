import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Вставь сюда свою строку подключения
    url: 'postgresql://postgres:password@localhost:5432/finance_db?schema=public',
  },
});