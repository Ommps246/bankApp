#pragma once

#include "Database.h"
#include "Utils.h"

// ─── Loan Service ──────────────────────────────────────
// Handles loan queries and EMI calculations.
class LoanService {
public:
    explicit LoanService(Database& db);

    // GET /api/loans — list loans for the authenticated user
    void getLoans(const Request& req, Response& res);

    // POST /api/loans — apply for a new loan
    void applyLoan(const Request& req, Response& res);

    // POST /api/loans/calculate — compute EMI and amortization schedule
    void calculateEMI(const Request& req, Response& res);

private:
    Database& m_db;
};
