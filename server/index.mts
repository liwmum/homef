import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// --- ОБЪЕКТ ДОКУМЕНТАЦИИ ---
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
            in: 'query',
            name: 'page',
            required: false,
            schema: { type: 'integer', default: 1 },
            description: 'Номер страницы'
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', default: 5 },
            description: 'Количество пользователей на странице'
          }
        ],
        responses: { 
          200: { 
            description: 'Успешный возврат списка',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/User' } },
                    meta: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          } 
        } 
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
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Вова' },
                  email: { type: 'string', example: 'vova@test.com' },
                  password: { type: 'string', example: 'pass123' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Пользователь успешно создан' },
          400: { description: 'Ошибка валидации' }
        }
      }
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Получить одного пользователя по ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { 
            description: 'Пользователь найден',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
          },
          404: { description: 'Пользователь не найден' }
        }
      },
      put: {
        tags: ['Users'],
        summary: 'Обновить данные пользователя',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { 
            description: 'Пользователь обновлен',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } }
          }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Удалить пользователя по ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Успешно удалено' }
        }
      }
    },

    // --- СЧЕТА (ACCOUNTS) ---
    '/api/accounts': {
      get: {
        tags: ['Accounts'],
        summary: 'Получить список всех счетов (пагинация)',
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 }, description: 'Номер страницы' },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 5 }, description: 'Счетов на странице' }
        ],
        responses: {
          200: {
            description: 'Успешный возврат списка счетов',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Account' } },
                    meta: { $ref: '#/components/schemas/Pagination' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Accounts'],
        summary: 'Создать новый счет',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'balance', 'userId'],
                properties: {
                  name: { type: 'string', example: 'Основная карта' },
                  balance: { type: 'number', example: 1000 },
                  userId: { type: 'integer', example: 1 }
                }
              }
            }
          }
        },
        responses: {
          200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Account' } } } },
          400: { description: 'Ошибка валидации или пользователь не найден' }
        }
      }
    },
    '/api/accounts/{id}': {
      get: {
        tags: ['Accounts'],
        summary: 'Получить детали счета по ID',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Account' } } } },
          404: { description: 'Счет не найден' }
        }
      },
      put: {
        tags: ['Accounts'],
        summary: 'Изменить данные счета',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Накопительный счет' },
                  balance: { type: 'number' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Обновлено' }, 404: { description: 'Не найден' } }
      },
      delete: {
        tags: ['Accounts'],
        summary: 'Удалить счет',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Удалено' } }
      }
    },



    // --- КАТЕГОРИИ ---
    '/api/categories': {
      get: {
    tags: ['Categories'],
    parameters: [
      { in: 'query', name: 'page', schema: { type: 'integer' } },
      { in: 'query', name: 'limit', schema: { type: 'integer' } }
    ],
        responses: {
          200: {
            content: { 'application/json': { schema: { 
              type: 'object', 
              properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Category' } }, meta: { $ref: '#/components/schemas/Pagination' } } 
            } } }
          }
        }
      },
      post: {
    tags: ['Categories'],
    requestBody: {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'type'],
            properties: {
              name: { type: 'string' },
              type: { type: 'string' }
            }
          }
        }
      }
    },
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } } }
      }
    },
    '/api/categories/{id}': {
      get: { tags: ['Categories'], summary: 'Детали категории', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } } } },
      put: { tags: ['Categories'], summary: 'Изменить категорию', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' } } } } } }, responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Categories'], summary: 'Удалить категорию', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'OK' } } }
    },

    // --- ТРАНЗАКЦИИ ---
    '/api/transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'Список транзакций (пагинация)',
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } }
        ],
        responses: { 200: { content: { 'application/json': { schema: { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Transaction' } }, meta: { $ref: '#/components/schemas/Pagination' } } } } } } }
      },
      post: {
        tags: ['Transactions'],
        summary: 'Создать транзакцию',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { 
            type: 'object', 
            required: ['amount', 'accountId', 'categoryId'], 
            properties: { amount: { type: 'number' }, accountId: { type: 'integer' }, categoryId: { type: 'integer' }, description: { type: 'string' } } 
          } } }
        },
        responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Transaction' } } } } }
      }
    },
    '/api/transactions/{id}': {
      get: { tags: ['Transactions'], summary: 'Детали транзакции', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Transaction' } } } } } },
      put: {
        tags: ['Transactions'],
        summary: 'Изменить транзакцию (с пересчетом баланса)',
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { amount: { type: 'number' }, description: { type: 'string' }, categoryId: { type: 'integer' } } } } } },
        responses: { 200: { description: 'Обновлено' } }
      },
      delete: { tags: ['Transactions'], summary: 'Удалить транзакцию (откат баланса)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Удалено' } } }
    }
  },
  // --- ВОТ ЭТУ СЕКЦИЮ МЫ ДОБАВИЛИ, ЧТОБЫ ИСЧЕЗЛА ОШИБКА RESOLVER ERROR ---
components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          email: { type: 'string' }
        }
      },
      Account: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          balance: { type: 'number' },
          userId: { type: 'integer' },
          user: { $ref: '#/components/schemas/User' }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' },
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] }
        }
      },
      Transaction: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          amount: { type: 'number' },
          description: { type: 'string' },
          accountId: { type: 'integer' },
          categoryId: { type: 'integer' },
          category: { $ref: '#/components/schemas/Category' },
          account: { $ref: '#/components/schemas/Account' }
        }
      },
      Pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          totalPages: { type: 'integer' }
        }
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
        totalPages: Math.ceil(total / limit)
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
app.put('/api/users/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { name, email, password } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // Используем оператор объединения, чтобы обновлять только присланные поля
        ...(name && { name }),
        ...(email && { email }),
        ...(password && { password }),
      },
    });

    res.json(updatedUser);
  } catch (error: any) {
    console.error("UPDATE ERROR:", error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.status(500).json({ error: "Ошибка при обновлении пользователя" });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = Number(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true } // Подтягиваем связанные счета
    });

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json(user);
  } catch (error) {
    console.error("GET USER ERROR:", error);
    res.status(500).json({ error: "Ошибка сервера при получении пользователя" });
  }
});


// --- API ACCOUNTS ---

// 1. GET - Список счетов
app.get('/api/accounts', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        skip: skip,
        take: limit,
        include: { user: true }, // Видим владельца
        orderBy: { id: 'desc' }
      }),
      prisma.account.count()
    ]);

    res.json({
      data: accounts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении списка счетов" });
  }
});

// 2. POST - Создание счета
app.post('/api/accounts', async (req, res) => {
  try {
    const { name, balance, userId } = req.body;

    if (!name || balance === undefined || !userId) {
      return res.status(400).json({ error: "Имя, баланс и userId обязательны" });
    }

    // Проверяем, существует ли такой пользователь
    const userExists = await prisma.user.findUnique({ where: { id: Number(userId) } });
    if (!userExists) return res.status(400).json({ error: "Указанный пользователь не существует" });

    const account = await prisma.account.create({
      data: { name, balance: Number(balance), userId: Number(userId) }
    });
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при создании счета" });
  }
});

// 3. GET - Детали счета
app.get('/api/accounts/:id', async (req, res) => {
  const account = await prisma.account.findUnique({
    where: { id: Number(req.params.id) },
    include: { transactions: true } // Показываем историю операций
  });
  if (!account) return res.status(404).json({ error: "Счет не найден" });
  res.json(account);
});

// 4. PUT - Изменение счета
app.put('/api/accounts/:id', async (req, res) => {
  try {
    const { name, balance } = req.body;
    const updated = await prisma.account.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name && { name }),
        ...(balance !== undefined && { balance: Number(balance) })
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(404).json({ error: "Счет не найден" });
  }
});

// 5. DELETE - Удаление счета
app.delete('/api/accounts/:id', async (req, res) => {
  try {
    await prisma.account.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Счет успешно удален" });
  } catch (error) {
    res.status(404).json({ error: "Счет не найден" });
  }
});



// --- CATEGORIES API ---

// 1. GET - Список с пагинацией
app.get('/api/categories', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const [data, total] = await Promise.all([
      prisma.category.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.category.count()
    ]);
    res.json({ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении категорий" });
  }
});

// 2. POST - Создание
app.post('/api/categories', async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ error: "Поля name и type обязательны" });
    
    const category = await prisma.category.create({
      data: { name, type }
    });
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: "Ошибка при создании категории" });
  }
});

// 3. GET - Детально по ID
app.get('/api/categories/:id', async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: Number(req.params.id) } });
  category ? res.json(category) : res.status(404).json({ error: "Категория не найдена" });
});

// 4. PUT - Изменение
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name, type } = req.body;
    const updated = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(name && { name }),
        ...(type && { type })
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(404).json({ error: "Категория не найдена" });
  }
});

// 5. DELETE - Удаление
app.delete('/api/categories/:id', async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.json({ success: true, message: "Категория удалена" });
  } catch (error) {
    res.status(404).json({ error: "Категория не найдена" });
  }
});

// --- TRANSACTIONS API ---

// 1. GET - Список с пагинацией и связями
app.get('/api/transactions', async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true, // Подтягиваем категорию
          account: {
            include: {
              user: true // ГЛУБОКИЙ INCLUDE: подтягиваем владельца счета
            }
          }
        },
        orderBy: { id: 'desc' } // Сортируем по ID, если createdAt еще не добавили
      }),
      prisma.transaction.count()
    ]);
    res.json({ data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении транзакций" });
  }
});

// 2. POST - Создание + Обновление баланса
app.post('/api/transactions', async (req, res) => {
  const { amount, accountId, categoryId, description } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          amount: Number(amount),
          accountId: Number(accountId),
          categoryId: Number(categoryId),
          description: description || ""
        }
      });
      // Обновляем баланс: если сумма -500, баланс уменьшится
      await tx.account.update({
        where: { id: Number(accountId) },
        data: { balance: { increment: Number(amount) } }
      });
      return transaction;
    });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: "Ошибка создания транзакции" });
  }
});

// 3. GET - Детально по ID
app.get('/api/transactions/:id', async (req, res) => {
  const tx = await prisma.transaction.findUnique({
    where: { id: Number(req.params.id) },
    include: { account: true, category: true }
  });
  tx ? res.json(tx) : res.status(404).json({ error: "Транзакция не найдена" });
});

// 4. PUT - Изменение + Корректировка баланса
app.put('/api/transactions/:id', async (req, res) => {
  const { amount, description, categoryId } = req.body;
  const id = Number(req.params.id);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const oldTx = await tx.transaction.findUnique({ where: { id } });
      if (!oldTx) throw new Error("Транзакция не найдена");

      // Если сумма изменилась, считаем разницу
      if (amount !== undefined && Number(amount) !== oldTx.amount) {
        const diff = Number(amount) - oldTx.amount;
        await tx.account.update({
          where: { id: oldTx.accountId },
          data: { balance: { increment: diff } }
        });
      }

      return await tx.transaction.update({
        where: { id },
        data: {
          ...(amount !== undefined && { amount: Number(amount) }),
          ...(categoryId && { categoryId: Number(categoryId) }),
          description
        }
      });
    });
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// 5. DELETE - Удаление + Откат баланса
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({ where: { id: Number(req.params.id) } });
      if (!transaction) throw new Error("Не найдена");

      // Важно: отнимаем ту сумму, которую когда-то прибавили
      await tx.account.update({
        where: { id: transaction.accountId },
        data: { balance: { decrement: transaction.amount } }
      });
      await tx.transaction.delete({ where: { id: transaction.id } });
    });
    res.json({ success: true, message: "Транзакция удалена, баланс возвращен" });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
  console.log('📖 Swagger UI available at http://localhost:3000/api-docs');
});