IF DB_ID('FlashGateway') IS NULL
BEGIN
  CREATE DATABASE FlashGateway;
END
GO

USE FlashGateway;
GO

IF OBJECT_ID('dbo.Merchants', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Merchants (
    id INT IDENTITY(1,1) PRIMARY KEY,
    merchantName NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    msisdn NVARCHAR(50) NULL UNIQUE,
    passwordHash NVARCHAR(255) NULL,
    role NVARCHAR(50) NOT NULL DEFAULT 'merchant',
    walletBalance DECIMAL(18,2) NOT NULL DEFAULT 0,
    status NVARCHAR(50) NOT NULL DEFAULT 'active',
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

IF OBJECT_ID('dbo.Settlements', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Settlements (
    id INT IDENTITY(1,1) PRIMARY KEY,
    merchantId INT NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    description NVARCHAR(255) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Settlements_Merchants FOREIGN KEY (merchantId) REFERENCES dbo.Merchants(id)
  );
END
GO

IF OBJECT_ID('dbo.WalletTransactions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.WalletTransactions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    merchantId INT NOT NULL,
    productId INT NULL,
    amount DECIMAL(18,2) NOT NULL,
    transactionType NVARCHAR(50) NOT NULL,
    serviceType NVARCHAR(50) NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'completed',
    reference NVARCHAR(255) NULL,
    recipientName NVARCHAR(255) NULL,
    recipientAccountNumber NVARCHAR(50) NULL,
    recipientBank NVARCHAR(255) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_WalletTransactions_Merchants FOREIGN KEY (merchantId) REFERENCES dbo.Merchants(id)
  );
END
GO

IF OBJECT_ID('dbo.PaymentMethods', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.PaymentMethods (
    id INT IDENTITY(1,1) PRIMARY KEY,
    merchantId INT NOT NULL,
    nickname NVARCHAR(255) NOT NULL,
    cardNumber NVARCHAR(50) NOT NULL,
    expiryDate NVARCHAR(20) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'Active',
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_PaymentMethods_Merchants FOREIGN KEY (merchantId) REFERENCES dbo.Merchants(id)
  );
END
GO

IF OBJECT_ID('dbo.Beneficiaries', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Beneficiaries (
    id INT IDENTITY(1,1) PRIMARY KEY,
    merchantId INT NOT NULL,
    beneficiaryName NVARCHAR(255) NOT NULL,
    bank NVARCHAR(255) NULL,
    accountNumber NVARCHAR(50) NULL,
    reference NVARCHAR(255) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Beneficiaries_Merchants FOREIGN KEY (merchantId) REFERENCES dbo.Merchants(id)
  );
END
GO

-- Products table: stores named products and brands (airtime/data/voucher etc.)
IF OBJECT_ID('dbo.Products', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    productType NVARCHAR(50) NOT NULL, -- e.g. airtime, data, voucher
    brand NVARCHAR(100) NULL,
    unitPrice DECIMAL(18,2) NOT NULL DEFAULT 0,
    metadata NVARCHAR(1000) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END
GO

-- Add FK from WalletTransactions to Products (optional, allows NULL)
IF OBJECT_ID('FK_WalletTransactions_Products', 'F') IS NULL
BEGIN
  ALTER TABLE dbo.WalletTransactions ADD CONSTRAINT FK_WalletTransactions_Products FOREIGN KEY (productId) REFERENCES dbo.Products(id);
END
GO
