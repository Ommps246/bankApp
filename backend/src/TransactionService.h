#pragma once

#include "Database.h"
#include "Utils.h"

// ─── Transaction Service ───────────────────────────────
// Handles transaction history queries and analytics.
class TransactionService {
public:
    explicit TransactionService(Database& db);

    // GET /api/transactions — list user transactions (sorted newest first)
    void getTransactions(const Request& req, Response& res);

    // GET /api/analytics — compute income/expense/balance analytics
    void getAnalytics(const Request& req, Response& res);

private:
    Database& m_db;
};
