import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors'; // Важно: установи это (npm install cors)

const app = express();
const prisma = new PrismaClient();

app.use(cors()); // Разрешаем фронтенду делать запросы к бэкенду
app.use(express.json());

// Получить всех пользователей
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany({ include: { accounts: true } });
  res.json(users);
});

// Создать пользователя
app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  const user = await prisma.user.create({
    data: { 
      name, 
      email, 
      password: 'password123',
      accounts: { create: { name: 'Основной', balance: 0 } }
    }
  });
  res.json(user);
});

// Удалить пользователя
app.delete('/api/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.account.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
  res.json({ success: true });
});

app.listen(3000, () => console.log('🚀 API запущен на http://localhost:3000'));