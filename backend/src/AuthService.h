#pragma once

#include "Database.h"
#include "Utils.h"

// ─── Authentication Service ────────────────────────────
// Handles user login, registration, and token management.
class AuthService {
public:
    explicit AuthService(Database& db);

    // POST /api/auth/login — authenticate and return token
    void login(const Request& req, Response& res);

    // POST /api/auth/register — create user + default account
    void registerUser(const Request& req, Response& res);

private:
    Database& m_db;
};
