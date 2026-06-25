#include "../include/httplib.h"
#include "Database.h"
#include "Utils.h"
#include "AuthService.h"
#include "AccountService.h"
#include "TransactionService.h"
#include "InvestmentService.h"
#include "LoanService.h"
#include "AdminService.h"

#include <iostream>

using namespace httplib;

int main() {
    // ── Initialize persistence layer ──
    Database db("data/database.json");

    // ── Initialize service objects ──
    AuthService        authService(db);
    AccountService     accountService(db);
    TransactionService transactionService(db);
    InvestmentService  investmentService(db);
    LoanService        loanService(db);
    AdminService       adminService(db);

    // ── Configure HTTP server ──
    Server svr;

    // CORS preflight handler
    svr.Options(".*", [](const Request&, Response& res) {
        Utils::setCors(res);
        res.set_content("", "text/plain");
    });

    // ── Auth routes ──
    svr.Post("/api/auth/login",    [&](const Request& req, Response& res) { authService.login(req, res); });
    svr.Post("/api/auth/register", [&](const Request& req, Response& res) { authService.registerUser(req, res); });

    // ── Account routes ──
    svr.Get( "/api/accounts", [&](const Request& req, Response& res) { accountService.getAccounts(req, res); });
    svr.Post("/api/accounts", [&](const Request& req, Response& res) { accountService.createAccount(req, res); });
    svr.Post("/api/transfer",  [&](const Request& req, Response& res) { accountService.transfer(req, res); });

    // ── Transaction & Analytics routes ──
    svr.Get("/api/transactions", [&](const Request& req, Response& res) { transactionService.getTransactions(req, res); });
    svr.Get("/api/analytics",    [&](const Request& req, Response& res) { transactionService.getAnalytics(req, res); });

    // ── Investment routes ──
    svr.Get( "/api/investments", [&](const Request& req, Response& res) { investmentService.getInvestments(req, res); });
    svr.Post("/api/investments", [&](const Request& req, Response& res) { investmentService.createInvestment(req, res); });

    // ── Loan routes ──
    svr.Get( "/api/loans",           [&](const Request& req, Response& res) { loanService.getLoans(req, res); });
    svr.Post("/api/loans",           [&](const Request& req, Response& res) { loanService.applyLoan(req, res); });
    svr.Post("/api/loans/calculate", [&](const Request& req, Response& res) { loanService.calculateEMI(req, res); });

    // ── Admin routes ──
    svr.Get(   "/api/admin/users",              [&](const Request& req, Response& res) { adminService.getUsers(req, res); });
    svr.Get(   "/api/admin/stats",              [&](const Request& req, Response& res) { adminService.getStats(req, res); });
    svr.Delete(R"(/api/admin/users/(\w+))", [&](const Request& req, Response& res) { adminService.deleteUser(req, res); });

    // ── Start server ──
    std::cout << "\n";
    std::cout << "╔══════════════════════════════════════╗\n";
    std::cout << "║    🏦 BankApp API Server v2.0       ║\n";
    std::cout << "║    Object-Oriented Architecture     ║\n";
    std::cout << "║    Running on http://localhost:8080  ║\n";
    std::cout << "╚══════════════════════════════════════╝\n";
    std::cout << "\n";

    svr.listen("0.0.0.0", 8080);
    return 0;
}
