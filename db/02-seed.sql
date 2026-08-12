USE FlashGateway;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Merchants WHERE email = 'merchant@flashgateway.local')
BEGIN
  INSERT INTO dbo.Merchants (merchantName, email, msisdn, role, walletBalance, status)
  VALUES ('Ava Finance', 'merchant@flashgateway.local', '27721234567', 'merchant', 5000.00, 'active');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Merchants WHERE email = 'admin@flashgateway.local')
BEGIN
  INSERT INTO dbo.Merchants (merchantName, email, msisdn, role, walletBalance, status)
  VALUES ('Northstar Pay', 'admin@flashgateway.local', '27829876543', 'admin', 10000.00, 'active');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Settlements WHERE description = 'Settlement for voucher issue')
BEGIN
  INSERT INTO dbo.Settlements (merchantId, amount, description)
  VALUES (1, 450.00, 'Settlement for voucher issue');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Settlements WHERE description = 'Admin settlement')
BEGIN
  INSERT INTO dbo.Settlements (merchantId, amount, description)
  VALUES (2, 1200.00, 'Admin settlement');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.WalletTransactions WHERE merchantId = 1 AND amount = 5000.00 AND transactionType = 'credit')
BEGIN
  INSERT INTO dbo.WalletTransactions (merchantId, amount, transactionType, serviceType, status, reference)
  VALUES (1, 5000.00, 'credit', NULL, 'completed', 'Initial funding');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.WalletTransactions WHERE merchantId = 2 AND amount = 10000.00 AND transactionType = 'credit')
BEGIN
  INSERT INTO dbo.WalletTransactions (merchantId, amount, transactionType, serviceType, status, reference)
  VALUES (2, 10000.00, 'credit', NULL, 'completed', 'Initial funding');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.PaymentMethods WHERE merchantId = 1 AND nickname = 'Primary Visa')
BEGIN
  INSERT INTO dbo.PaymentMethods (merchantId, nickname, cardNumber, expiryDate, status)
  VALUES (1, 'Primary Visa', '**** 1234', '12/26', 'Active');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.PaymentMethods WHERE merchantId = 1 AND nickname = 'Backup Mastercard')
BEGIN
  INSERT INTO dbo.PaymentMethods (merchantId, nickname, cardNumber, expiryDate, status)
  VALUES (1, 'Backup Mastercard', '**** 9876', '05/27', 'Active');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Beneficiaries WHERE merchantId = 1 AND beneficiaryName = 'Acme Supplies')
BEGIN
  INSERT INTO dbo.Beneficiaries (merchantId, beneficiaryName, bank, accountNumber, reference)
  VALUES (1, 'Acme Supplies', 'Standard Bank', '1234567890', 'Office expenses');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Beneficiaries WHERE merchantId = 1 AND beneficiaryName = 'Travel Co')
BEGIN
  INSERT INTO dbo.Beneficiaries (merchantId, beneficiaryName, bank, accountNumber, reference)
  VALUES (1, 'Travel Co', 'FNB', '0987654321', 'Corporate travel');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE name = 'Airtime - 50 ZAR')
BEGIN
  INSERT INTO dbo.Products (name, productType, brand, unitPrice)
  VALUES ('Airtime - 50 ZAR', 'airtime', 'MTN', 50.00);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE name = 'Data - 1GB')
BEGIN
  INSERT INTO dbo.Products (name, productType, brand, unitPrice)
  VALUES ('Data - 1GB', 'data', 'Vodafone', 99.00);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Products WHERE name = 'Voucher - Basic')
BEGIN
  INSERT INTO dbo.Products (name, productType, brand, unitPrice)
  VALUES ('Voucher - Basic', 'voucher', 'Generic', 10.00);
END
GO
