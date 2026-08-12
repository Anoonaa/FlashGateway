import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import fs from 'fs';
let swaggerUi = null;
let swaggerJsdoc = null;
try {
  const _sui = await import('swagger-ui-express').catch(() => null);
  swaggerUi = _sui ? _sui.default || _sui : null;
  const _sjs = await import('swagger-jsdoc').catch(() => null);
  swaggerJsdoc = _sjs ? _sjs.default || _sjs : null;
  if (!swaggerUi || !swaggerJsdoc) console.warn('Swagger modules not available, API docs disabled');
} catch (e) {
  console.warn('Swagger dynamic import failed, API docs disabled', e?.message || e);
}

dotenv.config();

console.log('FlashGateway API bootstrap starting...');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 4001);
const JWT_SECRET = process.env.JWT_SECRET || 'flashgateway-local-secret';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FlashGateway API',
      version: '1.0.0',
      description: 'FlashGateway REST API documentation',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
        },
        Password: {
          type: 'string',
          format: 'password',
          minLength: 8,
          pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$',
          description: 'Minimum 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.',
          example: 'Password123!',
        },
        PurchaseRequest: {
          type: 'object',
          required: ['amount'],
          properties: {
            amount: { type: 'number', format: 'double', example: 100 },
            product: { type: 'string', nullable: true, example: 'Airtime' },
            productId: { type: 'integer', nullable: true, example: 1 },
          },
        },
        ServicePurchaseRequest: {
          type: 'object',
          required: ['senderAccountId', 'serviceType', 'network', 'phoneNumber', 'amount'],
          properties: {
            senderAccountId: { type: 'integer', example: 1 },
            serviceType: { type: 'string', enum: ['airtime', 'data', 'sms'], example: 'airtime' },
            network: { type: 'string', example: 'Vodacom' },
            phoneNumber: { type: 'string', example: '+27821234567' },
            amount: { type: 'number', format: 'double', minimum: 0.01, example: 100 },
            productId: { type: 'integer', nullable: true, example: 1 },
          },
        },
        TransferRequest: {
          type: 'object',
          required: ['senderAccountId', 'amount'],
          properties: {
            senderAccountId: { type: 'integer', example: 1 },
            recipientAccountId: { type: 'integer', nullable: true, example: 2, description: 'Use for an internal merchant transfer.' },
            recipientName: { type: 'string', example: 'Acme Supplies', description: 'Required for an external transfer.' },
            recipientBank: { type: 'string', nullable: true, example: 'Standard Bank' },
            recipientAccountNumber: { type: 'string', nullable: true, example: '1234567890', description: 'Required for an external transfer.' },
            amount: { type: 'number', format: 'double', minimum: 0.01, example: 250 },
            reference: { type: 'string', nullable: true, example: 'Office expenses' },
          },
        },
        BeneficiaryRequest: {
          type: 'object',
          required: ['beneficiaryName', 'accountNumber'],
          properties: {
            beneficiaryName: { type: 'string', example: 'Acme Supplies' },
            bank: { type: 'string', nullable: true, example: 'Standard Bank' },
            accountNumber: { type: 'string', example: '1234567890' },
            reference: { type: 'string', nullable: true, example: 'Office expenses' },
          },
        },
        PaymentMethodRequest: {
          type: 'object',
          required: ['cardNumber', 'nickname', 'expiryDate', 'cvv'],
          properties: {
            cardNumber: { type: 'string', example: '4111111111111111' },
            nickname: { type: 'string', example: 'Primary Visa' },
            expiryDate: { type: 'string', example: '12/26' },
            cvv: { type: 'string', format: 'password', example: '123' },
          },
        },
        PaymentMethodUpdateRequest: {
          type: 'object',
          required: ['nickname', 'expiryDate'],
          properties: {
            nickname: { type: 'string', example: 'Primary Visa' },
            expiryDate: { type: 'string', example: '12/26' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['System'],
          summary: 'Check API health',
          responses: { 200: { description: 'API is healthy' } },
        },
      },
      '/api/v1/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Sign in',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: {
            200: { description: 'JWT and user profile returned' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/api/v1/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a merchant',
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['email', 'fullName', 'password'], properties: { email: { type: 'string', format: 'email', example: 'newmerchant@example.com' }, fullName: { type: 'string', example: 'New Merchant' }, msisdn: { type: 'string', nullable: true, example: '+27821234567' }, password: { $ref: '#/components/schemas/Password' } } }, example: { email: 'newmerchant@example.com', fullName: 'New Merchant', msisdn: '+27821234567', password: 'Password123!' } } } },
          responses: { 201: { description: 'Merchant registered' }, 400: { description: 'Invalid registration details. Password must be at least 8 characters and contain uppercase, lowercase, numeric, and special characters.' }, 409: { description: 'Email or MSISDN already registered' } },
        },
      },
      '/api/v1/merchants/{id}': {
        get: {
          tags: ['Merchants'],
          summary: 'Get merchant profile',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Merchant profile' } },
        },
      },
      '/api/v1/merchants/{id}/balance': {
        get: {
          tags: ['Merchants'],
          summary: 'Get wallet balance',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Wallet balance' } },
        },
      },
      '/api/v1/merchants/{id}/settlements': {
        get: {
          tags: ['Merchants'],
          summary: 'List settlements',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Settlement history' } },
        },
      },
      '/api/v1/merchants/{id}/purchase': {
        post: {
          tags: ['Merchants'],
          summary: 'Make a merchant purchase',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PurchaseRequest' } } } },
          responses: { 200: { description: 'Purchase completed' } },
        },
      },
      '/accounts': {
        get: {
          tags: ['Accounts'],
          summary: 'List merchant accounts',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Account list' } },
        },
      },
      '/transactions/history': {
        get: {
          tags: ['Transactions'],
          summary: 'List transaction history',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Transaction history' } },
        },
      },
      '/transactions/pending': {
        get: {
          tags: ['Transactions'],
          summary: 'List pending transactions',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Pending transactions' } },
        },
      },
      '/transactions/service-purchase': {
        post: {
          tags: ['Transactions'],
          summary: 'Purchase airtime, data, or SMS',
          description: 'Debits the sender account, records a completed service purchase, and creates a settlement entry. Supported service types are airtime, data, and sms.',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ServicePurchaseRequest' }, example: { senderAccountId: 1, serviceType: 'airtime', network: 'Vodacom', phoneNumber: '+27821234567', amount: 100 } } } },
          responses: {
            200: { description: 'Service purchase completed and transaction returned' },
            400: { description: 'Invalid request or insufficient balance' },
            403: { description: 'Sender account does not match the authenticated merchant' },
          },
        },
      },
      '/transactions/transfer': {
        post: {
          tags: ['Transactions'],
          summary: 'Send money internally or to an external beneficiary',
          description: 'Debits the sender account and records a completed transfer. For internal transfers provide recipientAccountId. For one-off external transfers provide recipientName and recipientAccountNumber.',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TransferRequest' }, examples: { internal: { summary: 'Internal merchant transfer', value: { senderAccountId: 1, recipientAccountId: 2, amount: 250, reference: 'Internal settlement' } }, external: { summary: 'External beneficiary transfer', value: { senderAccountId: 1, recipientName: 'Acme Supplies', recipientBank: 'Standard Bank', recipientAccountNumber: '1234567890', amount: 250, reference: 'Office expenses' } } } } } },
          responses: {
            200: { description: 'Transfer completed and transaction returned' },
            400: { description: 'Invalid amount, insufficient balance, or missing recipient details' },
            403: { description: 'Sender account does not match the authenticated merchant' },
          },
        },
      },
      '/api/v1/ledger/metrics': {
        get: {
          tags: ['Administration'],
          summary: 'Get ledger metrics',
          security: [{ bearerAuth: [] }],
          description: 'Admin-only endpoint returning aggregate ledger metrics.',
          responses: { 200: { description: 'Ledger metrics' }, 403: { description: 'Admin role required' } },
        },
      },
      '/beneficiaries': {
        get: {
          tags: ['Beneficiaries'],
          summary: 'List beneficiaries',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Beneficiary list' } },
        },
        post: {
          tags: ['Beneficiaries'],
          summary: 'Create a beneficiary',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/BeneficiaryRequest' } } } },
          responses: { 200: { description: 'Beneficiary created' }, 400: { description: 'Name and account number are required' } },
        },
      },
      '/alerts': {
        get: {
          tags: ['Notifications'],
          summary: 'List alerts',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Alert list' } },
        },
      },
      '/payment-methods': {
        get: {
          tags: ['Payment Methods'],
          summary: 'List payment methods',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Payment method list' } },
        },
        post: {
          tags: ['Payment Methods'],
          summary: 'Add a payment method',
          security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentMethodRequest' } } } },
          responses: { 200: { description: 'Payment method created' }, 400: { description: 'All card details are required' }, 409: { description: 'Payment method already exists' } },
        },
      },
      '/payment-methods/{id}': {
        put: {
          tags: ['Payment Methods'],
          summary: 'Update a payment method',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PaymentMethodUpdateRequest' } } } },
          responses: { 200: { description: 'Payment method updated' }, 400: { description: 'Nickname and expiry date are required' } },
        },
        delete: {
          tags: ['Payment Methods'],
          summary: 'Delete a payment method',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: { 200: { description: 'Payment method deleted' } },
        },
      },
    },
  },
  apis: ['./src/index.js'],
};

let swaggerSpec = null;
if (swaggerJsdoc && swaggerUi) {
  try {
    swaggerSpec = swaggerJsdoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/openapi.json', (_req, res) => res.json(swaggerSpec));
    app.get('/docs', (_req, res) => res.redirect('/api-docs'));
  } catch (e) {
    console.warn('Failed to initialize Swagger docs:', e?.message || e);
    app.get('/docs', (_req, res) => res.status(404).send('API docs not available'));
  }
} else {
  app.get('/docs', (_req, res) => res.status(404).send('API docs not available'));
}

const isWindowsHost = process.platform === 'win32';
const isDocker = fs.existsSync('/.dockerenv') || fs.existsSync('/.dockerinit');
const defaultDbServer = process.env.DB_SERVER || (isDocker ? 'db' : 'localhost');
const defaultDbName = process.env.DB_NAME || 'FlashGateway';
const defaultDbPort = Number(process.env.DB_PORT || 1433);

const dbConfigCandidates = [];

if (isWindowsHost) {
  dbConfigCandidates.push({
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
    database: defaultDbName,
    driver: 'msnodesqlv8',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      trustedConnection: true
    }
  });

  dbConfigCandidates.push({
    server: process.env.DB_SERVER || 'localhost',
    database: defaultDbName,
    driver: 'msnodesqlv8',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      trustedConnection: true
    }
  });
}

const sqlUser = process.env.DB_USER || 'sa';
const sqlPass = process.env.DB_PASSWORD || 'Your_P@ssw0rd!';

const sqlAuthConfig = {
  server: defaultDbServer,
  database: defaultDbName,
  user: sqlUser,
  password: sqlPass,
  port: defaultDbPort,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

if (isWindowsHost && !isDocker) {
  sqlAuthConfig.driver = 'msnodesqlv8';
}

dbConfigCandidates.push(sqlAuthConfig);

const fallbackState = {
  merchants: [
    { id: 1, merchantName: 'Ava Finance', email: 'merchant@flashgateway.local', role: 'merchant', walletBalance: 5000.0, status: 'active' },
    { id: 2, merchantName: 'Northstar Pay', email: 'admin@flashgateway.local', role: 'admin', walletBalance: 10000.0, status: 'active' }
  ],
  settlements: [
    { id: 1, merchantId: 1, amount: 450.0, description: 'Settlement for voucher issue', createdAt: '2026-07-17T00:00:00Z' },
    { id: 2, merchantId: 2, amount: 1200.0, description: 'Admin settlement', createdAt: '2026-07-17T00:00:00Z' }
  ],
  walletTransactions: [
    { id: 1, merchantId: 1, amount: 5000.0, transactionType: 'credit', service_type: null, status: 'completed', createdAt: '2026-07-17T00:00:00Z' },
    { id: 2, merchantId: 2, amount: 10000.0, transactionType: 'credit', service_type: null, status: 'completed', createdAt: '2026-07-17T00:00:00Z' }
  ],
  paymentMethods: [
    { id: 1, merchantId: 1, nickname: 'Primary Visa', cardNumber: '**** 1234', expiryDate: '12/26', status: 'Active' },
    { id: 2, merchantId: 1, nickname: 'Backup Mastercard', cardNumber: '**** 9876', expiryDate: '05/27', status: 'Active' }
  ],
  beneficiaries: [
    { id: 1, merchantId: 1, beneficiaryName: 'Acme Supplies', bank: 'Standard Bank', accountNumber: '1234567890', reference: 'Office expenses', createdAt: '2026-07-17T00:00:00Z' },
    { id: 2, merchantId: 1, beneficiaryName: 'Travel Co', bank: 'FNB', accountNumber: '0987654321', reference: 'Corporate travel', createdAt: '2026-07-17T00:00:00Z' }
  ],
  alerts: [
    { id: 1, title: 'High-value withdrawal approved', type: 'info' },
    { id: 2, title: 'Airtime purchase completed', type: 'success' }
  ]
};

let pool;
let sqlModule;

async function getSql() {
  if (!sqlModule) {
    const imported = await import('mssql');
    sqlModule = imported.default || imported;
  }
  return sqlModule;
}

async function getPool() {
  if (!pool) {
    const sql = await getSql();
    let lastError = null;

    for (const config of dbConfigCandidates) {
      try {
        pool = await sql.connect(config);
        console.log('Connected to SQL Server using config:', {
          server: config.server,
          database: config.database,
          driver: config.driver || 'default'
        });
        break;
      } catch (error) {
        lastError = error;
        console.warn('SQL connection attempt failed for', config.server, error.message || error);
      }
    }

    if (!pool) {
      throw lastError || new Error('Unable to connect to SQL Server using any candidate configuration.');
    }
  }

  return pool;
}

async function getPoolOrFallback() {
  try {
    return { db: await getPool(), fallback: false };
  } catch (error) {
    console.warn('SQL Server unavailable, using fallback demo data.', error.message);
    return { db: null, fallback: true };
  }
}

function signToken(user) {
  return jwt.sign({ userId: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '8h' });
}

function validatePassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  return true;
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Authentication token required' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
}

function findMerchantByEmail(email) {
  return fallbackState.merchants.find((merchant) => merchant.email === email);
}

function findMerchantById(id) {
  return fallbackState.merchants.find((merchant) => merchant.id === id);
}

function getSettlementsForMerchant(id) {
  return fallbackState.settlements.filter((entry) => entry.merchantId === id).slice(0, 10);
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const { db, fallback } = await getPoolOrFallback();
  let merchant;

  if (fallback) {
    merchant = findMerchantByEmail(email);
  } else {
    const sql = await getSql();
    const result = await db.request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT TOP 1 * FROM dbo.Merchants WHERE email = @email');

    if (!result.recordset.length) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    merchant = result.recordset[0];
  }
  if (!merchant) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Verify password: if merchant has passwordHash (DB), compare bcrypt; otherwise allow default test password for seeded/demo accounts
  const pwHash = merchant.passwordHash || null;
  if (pwHash) {
    const ok = await bcrypt.compare(password, pwHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  } else {
    if (password !== 'Password123!') return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken({ id: merchant.id, role: merchant.role, email: merchant.email });
  res.json({
    token,
    user: {
      id: merchant.id,
      merchantId: merchant.id,
      email: merchant.email,
      role: merchant.role,
      name: merchant.merchantName || merchant.fullName,
      full_name: merchant.merchantName || merchant.fullName
    }
  });
});

app.post('/auth/register', async (req, res) => {
  const { email, fullName, msisdn, password } = req.body;
  if (!email || !fullName || !password) {
    return res.status(400).json({ message: 'Email, full name and password are required' });
  }

  const existing = findMerchantByEmail(email) || fallbackState.merchants.find((m) => m.msisdn === msisdn);
  if (existing) {
    return res.status(409).json({ message: 'Email or MSISDN already registered' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newMerchant = {
    id: fallbackState.merchants.length + 1,
    merchantName: fullName,
    email,
    msisdn: msisdn || null,
    passwordHash,
    role: 'merchant',
    walletBalance: 0.0,
    status: 'active'
  };
  fallbackState.merchants.push(newMerchant);
  res.status(201).json({ message: 'Registration successful', user: { id: newMerchant.id, email: newMerchant.email, msisdn: newMerchant.msisdn } });
});

app.post('/api/v1/auth/register', async (req, res) => {
  const { email, fullName, msisdn, password } = req.body;
  if (!email || !fullName || !password) {
    return res.status(400).json({ message: 'Email, full name and password are required' });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ message: 'Password must be at least 8 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character.' });
  }

  const { db, fallback } = await getPoolOrFallback();
  if (fallback) {
    const existing = findMerchantByEmail(email) || fallbackState.merchants.find((m) => m.msisdn === msisdn);
    if (existing) return res.status(409).json({ message: 'Email or MSISDN already registered' });
    const passwordHash = bcrypt.hashSync(password, 10);
    const newMerchant = {
      id: fallbackState.merchants.length + 1,
      merchantName: fullName,
      email,
      msisdn: msisdn || null,
      passwordHash,
      role: 'merchant',
      walletBalance: 0.0,
      status: 'active'
    };
    fallbackState.merchants.push(newMerchant);
    return res.status(201).json({ message: 'Registration successful', user: { id: newMerchant.id, email: newMerchant.email, msisdn: newMerchant.msisdn } });
  }

  const sql = await getSql();
  // check duplicates by email or msisdn
  const dupCheck = await db.request()
    .input('email', sql.NVarChar(255), email)
    .input('msisdn', sql.NVarChar(50), msisdn || null)
    .query('SELECT TOP 1 id FROM dbo.Merchants WHERE email = @email OR (@msisdn IS NOT NULL AND msisdn = @msisdn)');

  if (dupCheck.recordset.length) return res.status(409).json({ message: 'Email or MSISDN already registered' });

  const passwordHash = bcrypt.hashSync(password, 10);
  const insert = await db.request()
    .input('merchantName', sql.NVarChar(255), fullName)
    .input('email', sql.NVarChar(255), email)
    .input('msisdn', sql.NVarChar(50), msisdn || null)
    .input('passwordHash', sql.NVarChar(255), passwordHash)
    .input('role', sql.NVarChar(50), 'merchant')
    .input('walletBalance', sql.Decimal(18, 2), 0)
    .input('status', sql.NVarChar(50), 'active')
    .query('INSERT INTO dbo.Merchants (merchantName, email, msisdn, passwordHash, role, walletBalance, status, createdAt) VALUES (@merchantName, @email, @msisdn, @passwordHash, @role, @walletBalance, @status, GETDATE()); SELECT SCOPE_IDENTITY() AS id;');

  res.status(201).json({ message: 'Registration successful', user: { id: Number(insert.recordset[0]?.id || 0), email, msisdn: msisdn || null } });
});

app.get('/api/v1/merchants/:id', verifyToken, async (req, res) => {
  const merchantId = Number(req.params.id);
  const { db, fallback } = await getPoolOrFallback();

  if (fallback) {
    const merchant = findMerchantById(merchantId);
    if (!merchant) return res.status(404).json({ message: 'Merchant not found' });
    return res.json(merchant);
  }

  const sql = await getSql();
  const result = await db.request()
    .input('id', sql.Int, merchantId)
    .query('SELECT id, merchantName, email, role, walletBalance, status FROM dbo.Merchants WHERE id = @id');

  if (!result.recordset.length) {
    return res.status(404).json({ message: 'Merchant not found' });
  }

  res.json(result.recordset[0]);
});

app.get('/api/v1/merchants/:id/balance', verifyToken, async (req, res) => {
  const merchantId = Number(req.params.id);
  const { db, fallback } = await getPoolOrFallback();

  if (fallback) {
    const merchant = findMerchantById(merchantId);
    if (!merchant) return res.status(404).json({ message: 'Merchant not found' });
    return res.json({ id: merchant.id, balance: merchant.walletBalance });
  }

  const sql = await getSql();
  const result = await db.request()
    .input('id', sql.Int, merchantId)
    .query('SELECT id, walletBalance AS balance FROM dbo.Merchants WHERE id = @id');

  if (!result.recordset.length) {
    return res.status(404).json({ message: 'Merchant not found' });
  }

  res.json(result.recordset[0]);
});

app.get('/api/v1/merchants/:id/settlements', verifyToken, async (req, res) => {
  const merchantId = Number(req.params.id);
  const { db, fallback } = await getPoolOrFallback();

  if (fallback) {
    return res.json({ items: getSettlementsForMerchant(merchantId) });
  }

  const sql = await getSql();
  const result = await db.request()
    .input('id', sql.Int, merchantId)
    .query('SELECT TOP 10 description, amount FROM dbo.Settlements WHERE merchantId = @id ORDER BY createdAt DESC');

  res.json({ items: result.recordset });
});

app.post('/api/v1/merchants/:id/purchase', verifyToken, async (req, res) => {
  const { amount, product, productId } = req.body;
  const merchantId = Number(req.params.id);
  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be greater than zero' });
  }

  const { db, fallback } = await getPoolOrFallback();
  if (fallback) {
    const merchant = findMerchantById(merchantId);
    if (!merchant) return res.status(404).json({ message: 'Merchant not found' });
    const commission = Number(amount) * 0.1;
    const settlementAmount = Number(amount) - commission;
    if (Number(merchant.walletBalance) < Number(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    merchant.walletBalance = Number(merchant.walletBalance) - Number(amount);
    fallbackState.settlements.unshift({
      id: fallbackState.settlements.length + 1,
      merchantId,
      amount: settlementAmount,
      description: `Settlement for ${product}`,
      createdAt: new Date().toISOString()
    });
    const tx = {
      id: fallbackState.walletTransactions.length + 1,
      merchantId,
      amount: Number(amount),
      transactionType: 'purchase',
      productId: productId || null,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    fallbackState.walletTransactions.unshift(tx);
    return res.json({ success: true, commission: commission.toFixed(2), settlementAmount: settlementAmount.toFixed(2) });
  }

  const sql = await getSql();
  const merchantResult = await db.request()
    .input('id', sql.Int, merchantId)
    .query('SELECT id, walletBalance, role FROM dbo.Merchants WHERE id = @id');

  if (!merchantResult.recordset.length) {
    return res.status(404).json({ message: 'Merchant not found' });
  }

  const merchant = merchantResult.recordset[0];
  const commission = Number(amount) * 0.1;
  const settlementAmount = Number(amount) - commission;

  if (Number(merchant.walletBalance) < Number(amount)) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  await db.request()
    .input('merchantId', sql.Int, merchantId)
    .input('amount', sql.Decimal(18, 2), settlementAmount)
    .input('description', sql.NVarChar(255), `Settlement for ${product}`)
    .query('INSERT INTO dbo.Settlements (merchantId, amount, description, createdAt) VALUES (@merchantId, @amount, @description, GETDATE())');

  await db.request()
    .input('merchantId', sql.Int, merchantId)
    .input('walletBalance', sql.Decimal(18, 2), Number(merchant.walletBalance) - Number(amount))
    .query('UPDATE dbo.Merchants SET walletBalance = @walletBalance WHERE id = @merchantId');

  // Insert a wallet transaction referencing the product (if provided and it exists)
  try {
    let normalizedProductId = productId || null;
    if (normalizedProductId !== null && Number(normalizedProductId) > 0) {
      const productCheck = await db.request()
        .input('productId', sql.Int, Number(normalizedProductId))
        .query('SELECT TOP 1 id FROM dbo.Products WHERE id = @productId');
      if (!productCheck.recordset.length) {
        normalizedProductId = null;
      }
    }

    await db.request()
      .input('merchantId', sql.Int, merchantId)
      .input('amount', sql.Decimal(18, 2), Number(amount))
      .input('transactionType', sql.NVarChar(50), 'purchase')
      .input('productId', sql.Int, normalizedProductId)
      .input('status', sql.NVarChar(50), 'completed')
      .query('INSERT INTO dbo.WalletTransactions (merchantId, amount, transactionType, productId, status, createdAt) VALUES (@merchantId, @amount, @transactionType, @productId, @status, GETDATE())');
  } catch (e) {
    console.warn('Failed to insert wallet transaction for purchase:', e?.message || e);
  }

  res.json({ success: true, commission: commission.toFixed(2), settlementAmount: settlementAmount.toFixed(2) });
});

app.get('/api/v1/ledger/metrics', verifyToken, requireRole('admin'), async (_req, res) => {
  const { db, fallback } = await getPoolOrFallback();
  if (fallback) {
    return res.json({ metrics: { merchantCount: fallbackState.merchants.length } });
  }

  const sql = await getSql();
  const result = await db.request().query('SELECT COUNT(*) AS merchantCount FROM dbo.Merchants');
  res.json({ metrics: result.recordset[0] });
});

app.get('/accounts', verifyToken, async (req, res) => {
  const accountId = Number(req.user.userId);
  const { db, fallback } = await getPoolOrFallback();

  if (fallback) {
    const merchant = findMerchantById(accountId);
    if (!merchant) return res.status(404).json({ message: 'Merchant account not found' });
    return res.json([
      { id: merchant.id, full_name: merchant.merchantName, email: merchant.email, balance: merchant.walletBalance, status: merchant.status },
    ]);
  }

  const sql = await getSql();
  const result = await db.request()
    .input('id', sql.Int, accountId)
    .query('SELECT id, merchantName AS full_name, email, walletBalance AS balance, status FROM dbo.Merchants WHERE id = @id');

  if (!result.recordset.length) {
    return res.status(404).json({ message: 'Account not found' });
  }

  res.json(result.recordset);
});

app.get('/beneficiaries', verifyToken, async (req, res) => {
  const accountId = Number(req.user.userId);
  const { db, fallback } = await getPoolOrFallback();

  if (fallback) {
    return res.json(
      fallbackState.beneficiaries
        .filter((item) => item.merchantId === accountId)
        .map((item) => ({
          id: item.id,
          beneficiary_name: item.beneficiaryName,
          bank: item.bank,
          account_number: item.accountNumber,
          reference: item.reference,
          created_at: item.createdAt,
        }))
    );
  }

  const sql = await getSql();
  const result = await db.request()
    .input('merchantId', sql.Int, accountId)
    .query(
      'SELECT id, beneficiaryName AS beneficiary_name, bank, accountNumber AS account_number, reference, createdAt AS created_at FROM dbo.Beneficiaries WHERE merchantId = @merchantId ORDER BY createdAt DESC'
    );

  res.json(result.recordset);
});

app.post('/beneficiaries', verifyToken, async (req, res) => {
  const accountId = Number(req.user.userId);
  const { beneficiaryName, bank, accountNumber, reference } = req.body;

  if (!beneficiaryName || !accountNumber) {
    return res.status(400).json({ message: 'Beneficiary name and account number are required' });
  }

  const { db, fallback } = await getPoolOrFallback();
  if (fallback) {
    const newBeneficiary = {
      id: fallbackState.beneficiaries.length + 1,
      merchantId: accountId,
      beneficiaryName,
      bank: bank || null,
      accountNumber,
      reference: reference || null,
      createdAt: new Date().toISOString(),
    };
    fallbackState.beneficiaries.unshift(newBeneficiary);
    return res.json({
      id: newBeneficiary.id,
      beneficiary_name: newBeneficiary.beneficiaryName,
      bank: newBeneficiary.bank,
      account_number: newBeneficiary.accountNumber,
      reference: newBeneficiary.reference,
      created_at: newBeneficiary.createdAt,
    });
  }

  const sql = await getSql();
  const insert = await db.request()
    .input('merchantId', sql.Int, accountId)
    .input('beneficiaryName', sql.NVarChar(255), beneficiaryName)
    .input('bank', sql.NVarChar(255), bank || null)
    .input('accountNumber', sql.NVarChar(50), accountNumber)
    .input('reference', sql.NVarChar(255), reference || null)
    .query(
      'INSERT INTO dbo.Beneficiaries (merchantId, beneficiaryName, bank, accountNumber, reference, createdAt) OUTPUT inserted.id, inserted.beneficiaryName AS beneficiary_name, inserted.bank, inserted.accountNumber AS account_number, inserted.reference, inserted.createdAt AS created_at VALUES (@merchantId, @beneficiaryName, @bank, @accountNumber, @reference, GETDATE())'
    );

  res.json(insert.recordset[0]);
});

app.get('/transactions/history', verifyToken, async (req, res) => {
  const accountId = Number(req.user.userId);
  const { db, fallback } = await getPoolOrFallback();

  if (fallback) {
    const transactions = fallbackState.walletTransactions
      .filter((tx) => tx.merchantId === accountId)
      .map((tx) => ({ ...tx, created_at: tx.createdAt }));
    return res.json(transactions);
  }

  const sql = await getSql();
  const result = await db.request()
    .input('id', sql.Int, accountId)
    .query(`SELECT
      id,
      merchantId,
      amount,
      transactionType AS transaction_type,
      serviceType AS service_type,
      status,
      reference,
      recipientName AS recipient_name,
      recipientAccountNumber AS recipient_account_number,
      recipientBank AS recipient_bank,
      createdAt AS created_at
    FROM dbo.WalletTransactions
    WHERE merchantId = @id
    ORDER BY createdAt DESC`);

  res.json(result.recordset);
});

app.get('/transactions/pending', verifyToken, async (req, res) => {
  const accountId = Number(req.user.userId);
  const { db, fallback } = await getPoolOrFallback();

  if (fallback) {
    const pending = fallbackState.walletTransactions
      .filter((tx) => tx.merchantId === accountId && tx.status === 'pending')
      .map((tx) => ({ ...tx, created_at: tx.createdAt }));
    return res.json(pending);
  }

  const sql = await getSql();
  const result = await db.request()
    .input('id', sql.Int, accountId)
    .query(`SELECT
      id,
      merchantId,
      amount,
      transactionType AS transaction_type,
      serviceType AS service_type,
      status,
      reference,
      recipientName AS recipient_name,
      recipientAccountNumber AS recipient_account_number,
      recipientBank AS recipient_bank,
      createdAt AS created_at
    FROM dbo.WalletTransactions
    WHERE merchantId = @id AND status = 'pending'
    ORDER BY createdAt DESC`);

  res.json(result.recordset);
});

app.post('/transactions/service-purchase', verifyToken, async (req, res) => {
  const { senderAccountId, serviceType, network, phoneNumber, amount, productId } = req.body;
  const accountId = Number(req.user.userId);

  if (accountId !== Number(senderAccountId)) {
    return res.status(403).json({ message: 'Sender account mismatch' });
  }

  if (!serviceType || !network || !phoneNumber || !amount || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Invalid service purchase request' });
  }

  const { db, fallback } = await getPoolOrFallback();

  if (fallback) {
    const merchant = findMerchantById(accountId);
    if (!merchant) return res.status(404).json({ message: 'Merchant account not found' });
    const commission = Number(amount) * 0.1;
    const settlementAmount = Number(amount) - commission;
    if (Number(merchant.walletBalance) < Number(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    merchant.walletBalance = Number(merchant.walletBalance) - Number(amount);
    const transaction = {
      id: fallbackState.walletTransactions.length + 1,
      merchantId: accountId,
      amount: Number(amount),
      transactionType: 'service_purchase',
      service_type: serviceType,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };
    fallbackState.walletTransactions.unshift(transaction);
    fallbackState.settlements.unshift({
      id: fallbackState.settlements.length + 1,
      merchantId: accountId,
      amount: settlementAmount,
      description: `Settlement for ${serviceType} top-up to ${phoneNumber}`,
      createdAt: new Date().toISOString(),
    });

    return res.json({ success: true, transaction });
  }

  const sql = await getSql();
  const merchantResult = await db.request()
    .input('id', sql.Int, accountId)
    .query('SELECT id, walletBalance FROM dbo.Merchants WHERE id = @id');

  if (!merchantResult.recordset.length) {
    return res.status(404).json({ message: 'Merchant account not found' });
  }

  const merchant = merchantResult.recordset[0];
  if (Number(merchant.walletBalance) < Number(amount)) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  const commission = Number(amount) * 0.1;
  const settlementAmount = Number(amount) - commission;

  const settlementInsert = await db.request()
    .input('merchantId', sql.Int, accountId)
    .input('amount', sql.Decimal(18, 2), settlementAmount)
    .input('description', sql.NVarChar(255), `Settlement for ${serviceType} top-up to ${phoneNumber}`)
    .query('INSERT INTO dbo.Settlements (merchantId, amount, description, createdAt) VALUES (@merchantId, @amount, @description, GETDATE())');

  let normalizedProductId = productId || null;
  if (normalizedProductId !== null && Number(normalizedProductId) > 0) {
    const productCheck = await db.request()
      .input('productId', sql.Int, Number(normalizedProductId))
      .query('SELECT TOP 1 id FROM dbo.Products WHERE id = @productId');
    if (!productCheck.recordset.length) {
      normalizedProductId = null;
    }
  }

  const transactionInsert = await db.request()
    .input('merchantId', sql.Int, accountId)
    .input('amount', sql.Decimal(18, 2), Number(amount))
    .input('transactionType', sql.NVarChar(50), 'service_purchase')
    .input('serviceType', sql.NVarChar(50), serviceType)
    .input('productId', sql.Int, normalizedProductId)
    .input('status', sql.NVarChar(50), 'completed')
    .query('INSERT INTO dbo.WalletTransactions (merchantId, amount, transactionType, serviceType, productId, status, createdAt) OUTPUT inserted.id, inserted.merchantId, inserted.amount, inserted.transactionType AS transaction_type, inserted.serviceType AS service_type, inserted.productId AS product_id, inserted.status, inserted.createdAt AS created_at VALUES (@merchantId, @amount, @transactionType, @serviceType, @productId, @status, GETDATE())');

  await db.request()
    .input('merchantId', sql.Int, accountId)
    .input('walletBalance', sql.Decimal(18, 2), Number(merchant.walletBalance) - Number(amount))
    .query('UPDATE dbo.Merchants SET walletBalance = @walletBalance WHERE id = @merchantId');

  const transaction = transactionInsert.recordset[0];
  res.json({ success: true, transaction });
});

app.post('/transactions/transfer', verifyToken, async (req, res) => {
  const {
    senderAccountId,
    recipientAccountId,
    recipientName,
    recipientBank,
    recipientAccountNumber,
    amount,
    reference,
  } = req.body;
  const accountId = Number(req.user.userId);

  if (accountId !== Number(senderAccountId)) {
    return res.status(403).json({ message: 'Sender account mismatch' });
  }

  if (!amount || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Invalid transfer amount' });
  }

  const internalRecipientId = recipientAccountId ? Number(recipientAccountId) : null;
  const isInternalTransfer = Boolean(internalRecipientId);

  const { db, fallback } = await getPoolOrFallback();
  if (fallback) {
    const sender = findMerchantById(accountId);
    if (!sender) {
      return res.status(404).json({ message: 'Sender not found' });
    }

    if (Number(sender.walletBalance) < Number(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    let recipient = null;
    if (isInternalTransfer) {
      recipient = findMerchantById(internalRecipientId);
      if (!recipient) {
        return res.status(404).json({ message: 'Recipient not found' });
      }
    } else if (!recipientName || !recipientAccountNumber) {
      return res.status(400).json({ message: 'Recipient details are required for one-off transfers' });
    }

    sender.walletBalance -= Number(amount);
    if (recipient) {
      recipient.walletBalance += Number(amount);
    }

    const transaction = {
      id: fallbackState.walletTransactions.length + 1,
      merchantId: accountId,
      amount: Number(amount),
      transactionType: 'transfer',
      status: 'completed',
      reference: reference || null,
      recipientName: recipient ? recipient.merchantName : recipientName,
      recipientAccountNumber: recipient ? `ACC-${recipient.id}` : recipientAccountNumber,
      recipientBank: recipient ? null : recipientBank,
      createdAt: new Date().toISOString(),
    };
    fallbackState.walletTransactions.unshift(transaction);
    return res.json({ ...transaction });
  }

  const sql = await getSql();
  const senderResult = await db.request()
    .input('id', sql.Int, accountId)
    .query('SELECT id, walletBalance FROM dbo.Merchants WHERE id = @id');

  if (!senderResult.recordset.length) {
    return res.status(404).json({ message: 'Sender not found' });
  }

  const sender = senderResult.recordset[0];
  if (Number(sender.walletBalance) < Number(amount)) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  let recipient = null;
  if (isInternalTransfer) {
    const recipientResult = await db.request()
      .input('recipientId', sql.Int, internalRecipientId)
      .query('SELECT id, walletBalance, merchantName FROM dbo.Merchants WHERE id = @recipientId');

    if (!recipientResult.recordset.length) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    recipient = recipientResult.recordset[0];
  }

  if (!isInternalTransfer && (!recipientName || !recipientAccountNumber)) {
    return res.status(400).json({ message: 'Recipient name and account number are required for one-off transfers' });
  }

  if (recipient) {
    await db.request()
      .input('senderId', sql.Int, accountId)
      .input('recipientId', sql.Int, internalRecipientId)
      .input('senderBalance', sql.Decimal(18, 2), Number(sender.walletBalance) - Number(amount))
      .input('recipientBalance', sql.Decimal(18, 2), Number(recipient.walletBalance) + Number(amount))
      .query('UPDATE dbo.Merchants SET walletBalance = @senderBalance WHERE id = @senderId; UPDATE dbo.Merchants SET walletBalance = @recipientBalance WHERE id = @recipientId');
  }

  const transactionInsert = await db.request()
    .input('merchantId', sql.Int, accountId)
    .input('amount', sql.Decimal(18, 2), Number(amount))
    .input('transactionType', sql.NVarChar(50), 'transfer')
    .input('status', sql.NVarChar(50), 'completed')
    .input('reference', sql.NVarChar(255), reference || null)
    .input('recipientName', sql.NVarChar(255), recipient ? recipient.merchantName : recipientName)
    .input('recipientAccountNumber', sql.NVarChar(50), recipient ? `ACC-${recipient.id}` : recipientAccountNumber)
    .input('recipientBank', sql.NVarChar(255), recipient ? null : recipientBank || null)
    .query(
      'INSERT INTO dbo.WalletTransactions (merchantId, amount, transactionType, status, reference, recipientName, recipientAccountNumber, recipientBank, createdAt) OUTPUT inserted.id, inserted.merchantId, inserted.amount, inserted.transactionType AS transaction_type, inserted.status, inserted.reference, inserted.recipientName AS recipient_name, inserted.recipientAccountNumber AS recipient_account_number, inserted.recipientBank AS recipient_bank, inserted.createdAt AS created_at VALUES (@merchantId, @amount, @transactionType, @status, @reference, @recipientName, @recipientAccountNumber, @recipientBank, GETDATE())'
    );

  if (!recipient) {
    await db.request()
      .input('merchantId', sql.Int, accountId)
      .input('walletBalance', sql.Decimal(18, 2), Number(sender.walletBalance) - Number(amount))
      .query('UPDATE dbo.Merchants SET walletBalance = @walletBalance WHERE id = @merchantId');
  }

  const transaction = transactionInsert.recordset[0];
  res.json(transaction);
});

app.get('/alerts', verifyToken, async (req, res) => {
  const accountId = Number(req.user.userId);
  const { db, fallback } = await getPoolOrFallback();

  if (fallback) {
    return res.json(fallbackState.alerts.map((alert) => ({ ...alert, accountId })));
  }

  const sql = await getSql();
  const result = await db.request()
    .input('id', sql.Int, accountId)
    .query(`SELECT TOP 5 id, amount, transactionType, status, createdAt FROM dbo.WalletTransactions WHERE merchantId = @id ORDER BY createdAt DESC`);

  const alerts = result.recordset.map((tx) => ({
    id: tx.id,
    title: `${tx.transactionType === 'transfer' ? 'Transfer' : 'Service'} ${tx.status}`,
    type: tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'info',
    message: `R ${Number(tx.amount).toFixed(2)} ${tx.transactionType} - ${new Date(tx.createdAt).toLocaleDateString('en-ZA')}`,
    created_at: tx.createdAt,
    accountId,
  }));

  res.json(alerts);
});

app.get('/payment-methods', verifyToken, async (req, res) => {
  const accountId = Number(req.user.userId);
  const { db, fallback } = await getPoolOrFallback();
  if (fallback) {
    return res.json(fallbackState.paymentMethods.filter((method) => method.merchantId === accountId));
  }

  const sql = await getSql();
  const result = await db.request()
    .input('merchantId', sql.Int, accountId)
    .query('SELECT id, merchantId, nickname, cardNumber, expiryDate, status FROM dbo.PaymentMethods WHERE merchantId = @merchantId ORDER BY createdAt DESC');

  res.json(result.recordset);
});

app.post('/payment-methods', verifyToken, async (req, res) => {
  const accountId = Number(req.user.userId);
  const { cardNumber, nickname, expiryDate, cvv } = req.body;

  if (!cardNumber || !nickname || !expiryDate || !cvv) {
    return res.status(400).json({ message: 'Payment method details are required' });
  }

  const { db, fallback } = await getPoolOrFallback();
  if (fallback) {
    if (fallbackState.paymentMethods.find((m) => m.cardNumber === cardNumber && m.merchantId === accountId)) {
      return res.status(409).json({ message: 'Payment method already exists' });
    }

    const newMethod = {
      id: fallbackState.paymentMethods.length + 1,
      merchantId: accountId,
      nickname,
      cardNumber: `**** ${String(cardNumber).slice(-4)}`,
      expiryDate,
      status: 'Active',
    };

    fallbackState.paymentMethods.push(newMethod);
    return res.json(newMethod);
  }

  const sql = await getSql();
  const existing = await db.request()
    .input('merchantId', sql.Int, accountId)
    .input('cardNumber', sql.NVarChar(50), cardNumber)
    .query('SELECT id FROM dbo.PaymentMethods WHERE merchantId = @merchantId AND cardNumber = @cardNumber');

  if (existing.recordset.length) {
    return res.status(409).json({ message: 'Payment method already exists' });
  }

  const insert = await db.request()
    .input('merchantId', sql.Int, accountId)
    .input('nickname', sql.NVarChar(255), nickname)
    .input('cardNumber', sql.NVarChar(50), `**** ${String(cardNumber).slice(-4)}`)
    .input('expiryDate', sql.NVarChar(20), expiryDate)
    .input('status', sql.NVarChar(50), 'Active')
    .query('INSERT INTO dbo.PaymentMethods (merchantId, nickname, cardNumber, expiryDate, status, createdAt) VALUES (@merchantId, @nickname, @cardNumber, @expiryDate, @status, GETDATE()); SELECT SCOPE_IDENTITY() AS id;');

  res.json({
    id: Number(insert.recordset[0]?.id || 0),
    merchantId: accountId,
    nickname,
    cardNumber: `**** ${String(cardNumber).slice(-4)}`,
    expiryDate,
    status: 'Active',
  });
});

app.put('/payment-methods/:id', verifyToken, async (req, res) => {
  const accountId = Number(req.user.userId);
  const methodId = Number(req.params.id);
  const { nickname, expiryDate } = req.body;

  if (!nickname || !expiryDate) {
    return res.status(400).json({ message: 'Payment method nickname and expiry date are required' });
  }

  const methodIndex = fallbackState.paymentMethods.findIndex(
    (method) => method.id === methodId && method.merchantId === accountId,
  );

  if (methodIndex < 0) {
    return res.status(404).json({ message: 'Payment method not found' });
  }

  fallbackState.paymentMethods[methodIndex] = {
    ...fallbackState.paymentMethods[methodIndex],
    nickname,
    expiryDate,
  };

  res.json(fallbackState.paymentMethods[methodIndex]);
});

app.delete('/payment-methods/:id', verifyToken, async (req, res) => {
  const accountId = Number(req.user.userId);
  const methodId = Number(req.params.id);
  const methodIndex = fallbackState.paymentMethods.findIndex(
    (method) => method.id === methodId && method.merchantId === accountId,
  );

  if (methodIndex < 0) {
    return res.status(404).json({ message: 'Payment method not found' });
  }

  fallbackState.paymentMethods.splice(methodIndex, 1);
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => console.log(`FlashGateway API running on port ${PORT}`));
