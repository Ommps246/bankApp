#include "TransactionService.h"
#include <algorithm>

TransactionService::TransactionService(Database& db)
    : m_db(db) {}

void TransactionService::getTransactions(const Request& req, Response& res) {
    Utils::setCors(res);
    std::string user_id = Utils::getUserId(req);
    if (user_id.empty()) { Utils::sendUnauthorized(res); return; }

    json db = m_db.load();
    json user_txns = json::array();
    for (auto& txn : db["transactions"]) {
        if (txn["user_id"] == user_id) {
            user_txns.push_back(txn);
        }
    }

    // Sort by date descending (newest first)
    std::sort(user_txns.begin(), user_txns.end(), [](const json& a, const json& b) {
        return a["date"].get<std::string>() > b["date"].get<std::string>();
    });

    res.set_content(user_txns.dump(), "application/json");
}

void TransactionService::getAnalytics(const Request& req, Response& res) {
    Utils::setCors(res);
    std::string user_id = Utils::getUserId(req);
    if (user_id.empty()) { Utils::sendUnauthorized(res); return; }

    json db = m_db.load();
    json analytics = db["analytics"];

    // Calculate total balance for this user
    double total_balance = 0;
    for (auto& acc : db["accounts"]) {
        if (acc["user_id"] == user_id) {
            total_balance += acc["balance"].get<double>();
        }
    }

    // Count transactions and compute income/expense totals
    int total_txns = 0;
    double total_income = 0, total_expense = 0;
    for (auto& txn : db["transactions"]) {
        if (txn["user_id"] == user_id) {
            total_txns++;
            if (txn["type"] == "credit")
                total_income += txn["amount"].get<double>();
            else
                total_expense += txn["amount"].get<double>();
        }
    }

    json response = {
        {"total_balance", total_balance},
        {"total_income", total_income},
        {"total_expense", total_expense},
        {"total_transactions", total_txns},
        {"monthly_spending", analytics["monthly_spending"]},
        {"spending_by_category", analytics["spending_by_category"]}
    };
    res.set_content(response.dump(), "application/json");
}
