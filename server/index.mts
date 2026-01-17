import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- ОБЪЕКТ ДОКУМЕНТАЦИИ  ---
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'FinTracker API',
    version: '1.0.0',
    description: 'Прямое описание API без использования swagger-jsdoc'
  },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
   '/api/users': {
      get: { 
        tags: ['Users'], 
        summary: 'Получить всех пользователей', 
        parameters: [
          {
            in: 'query',       // Параметр передается в строке запроса (?page=1)
            name: 'page',      // Имя параметра
            required: false,   // Необязательно
            schema: { 
              type: 'integer', 
              default: 1       // Значение по умолчанию
            },
            description: 'Номер страницы'
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { 
              type: 'integer', 
              default: 5 
            },
            description: 'Количество пользователей на странице'
          }
        ],
        responses: { 200: { description: 'Успешный возврат списка' } } 
      },
      post: {
        tags: ['Users'],
        summary: 'Создать нового пользователя',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'], // Указываем обязательные поля для Swagger
                properties: {
                  name: { type: 'string', example: 'Вова' },
                  email: { type: 'string', example: 'vova@test.com' },
                  password: { type: 'string', example: 'pass123' } // Добавили поле password
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Пользователь успешно создан' },
          400: { description: 'Ошибка валидации (проверьте email или поля)' }
        }
      }
  
    },
   '/api/users/{id}': {
    delete: {
    tags: ['Users'],
    summary: 'Удалить пользователя по ID',
    parameters: [
      {
        in: 'path',
        name: 'id',
        required: true,
        schema: { type: 'integer' },
        description: 'Уникальный ID пользователя'
      }
    ],
    responses: {
      200: { description: 'Пользователь и его счета успешно удалены' },
      404: { description: 'Пользователь не найден' },
      500: { description: 'Ошибка сервера' }
    }
  }
},

    '/api/accounts': {
      get: { tags: ['Accounts'], responses: { 200: { description: 'OK' } } },
      post: {
        tags: ['Accounts'],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, balance: { type: 'number' }, userId: { type: 'integer' } } } } } },
        responses: { 200: { description: 'OK' } }
      }
    },
    '/api/categories': {
      get: { tags: ['Categories'], responses: { 200: { description: 'OK' } } },
      post: {
        tags: ['Categories'],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } } } } } },
        responses: { 200: { description: 'OK' } }
      }
    },
    '/api/transactions': {
      post: {
        tags: ['Transactions'],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { amount: { type: 'number' }, accountId: { type: 'integer' }, categoryId: { type: 'integer' }, description: { type: 'string' } } } } } },
        responses: { 200: { description: 'OK' } }
      }
    }
  }
};

// Подключаем UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// --- ЛОГИКА (API) ---
// Получение пользователей
app.get('/api/users', async (req, res) => {
  try {
    // Получаем параметры из строки запроса (query strings)
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    
    // Рассчитываем, сколько записей нужно пропустить (skip)
    const skip = (page - 1) * limit;

    // Выполняем два запроса параллельно: сами данные и общее количество
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip: skip,
        take: limit,
        include: { accounts: true },
        orderBy: { id: 'desc' } // Сначала новые
      }),
      prisma.user.count()
    ]);

    // Возвращаем данные вместе с информацией о пагинации
    res.json({
      data: users,
      meta: {
        total,
        page,
        limit,
        PerPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении пользователей" });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Простая проверка на бэкенде
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Поля name, email и password обязательны" });
    }

    const user = await prisma.user.create({
      data: { name, email, password }
    });
    
    res.json(user);
  } catch (error: any) {
    console.error("PRISMA ERROR:", error);
    // Если email уже занят, Prisma выкинет ошибку. Обработаем её красиво:
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Пользователь с таким email уже существует" });
    }
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);

    // Выполняем удаление в транзакции, чтобы всё прошло успешно или всё отменилось
    await prisma.$transaction([
      // 1. Сначала удаляем все счета, привязанные к пользователю
      prisma.account.deleteMany({ where: { userId: userId } }),
      // 2. Затем удаляем самого пользователя
      prisma.user.delete({ where: { id: userId } })
    ]);

    res.json({ success: true, message: `Пользователь ${userId} и его данные удалены` });
  } catch (error: any) {
    console.error("DELETE ERROR:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.status(500).json({ error: "Не удалось удалить пользователя" });
  }
});


app.get('/api/accounts', async (req, res) => {
  const accounts = await prisma.account.findMany();
  res.json(accounts);
});

app.post('/api/accounts', async (req, res) => {
  const { name, balance, userId } = req.body;
  const account = await prisma.account.create({
    data: { name, balance: Number(balance), userId: Number(userId) }
  });
  res.json(account);
});

app.get('/api/categories', async (req, res) => {
  const categories = await prisma.category.findMany();
  res.json(categories);
});

app.post('/api/categories', async (req, res) => {
  const category = await prisma.category.create({ data: req.body });
  res.json(category);
});

app.post('/api/transactions', async (req, res) => {
  const { amount, accountId, categoryId, description } = req.body;
  const transaction = await prisma.transaction.create({
    data: { amount: Number(amount), accountId: Number(accountId), categoryId: Number(categoryId), description: description || "" }
  });
  await prisma.account.update({
    where: { id: Number(accountId) },
    data: { balance: { increment: Number(amount) } }
  });
  res.json(transaction);
});

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
  console.log('📖 Swagger UI available at http://localhost:3000/api-docs');
});