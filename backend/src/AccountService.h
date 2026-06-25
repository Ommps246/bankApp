#pragma once

#include "Database.h"
#include "Utils.h"

// ─── Account Service ───────────────────────────────────
// Manages bank accounts and inter-account fund transfers.
class AccountService {
public:
    explicit AccountService(Database& db);

    // GET /api/accounts — list accounts for the authenticated user
    void getAccounts(const Request& req, Response& res);

    // POST /api/accounts — create a new account
    void createAccount(const Request& req, Response& res);

    // POST /api/transfer — transfer funds between accounts
    void transfer(const Request& req, Response& res);

private:
    Database& m_db;
};
