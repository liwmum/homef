import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    url: 'postgresql://admin:secret_password@localhost:5432/finance_tracker?schema=public',
  },
});