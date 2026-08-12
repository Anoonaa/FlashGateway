SELECT
  m.id AS merchant_id,
  m.merchantName,
  m.email,
  m.walletBalance,
  t.id AS transaction_id,
  t.amount,
  t.transactionType,
  t.serviceType,
  t.status,
  t.createdAt AS transaction_created_at
FROM dbo.Merchants m
LEFT JOIN dbo.WalletTransactions t
  ON t.merchantId = m.id
ORDER BY m.id, t.createdAt DESC;