#pragma once

#include "Database.h"
#include "Utils.h"

// ─── Investment Service ────────────────────────────────
// Manages the user's investment portfolio.
class InvestmentService {
public:
    explicit InvestmentService(Database& db);

    // GET /api/investments — list portfolio with gain/loss calculations
    void getInvestments(const Request& req, Response& res);

    // POST /api/investments — add a new investment
    void createInvestment(const Request& req, Response& res);

private:
    Database& m_db;
};
