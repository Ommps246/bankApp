#include "AdminService.h"
#include <algorithm>

AdminService::AdminService(Database& db)
    : m_db(db) {}

bool AdminService::isAdmin(const std::string& user_id, const json& db) {
    for (auto& u : db["users"]) {
        if (u["id"] == user_id && u["role"] == "admin") {
            return true;
        }
    }
    return false;
}

void AdminService::getUsers(const Request& req, Response& res) {
    Utils::setCors(res);
    std::string user_id = Utils::getUserId(req);
    if (user_id.empty()) { Utils::sendUnauthorized(res); return; }

    json db = m_db.load();
    if (!isAdmin(user_id, db)) {
        Utils::sendError(res, 403, "Forbidden");
        return;
    }

    json users_list = json::array();
    for (auto& u : db["users"]) {
        json user_data = {
            {"id", u["id"]},
            {"username", u["username"]},
            {"name", u["name"]},
            {"email", u["email"]},
            {"role", u["role"]},
            {"avatar", u["avatar"]},
            {"created_at", u["created_at"]}
        };

        // Count accounts and total balance for each user
        int acc_count = 0;
        double total_bal = 0;
        for (auto& acc : db["accounts"]) {
            if (acc["user_id"] == u["id"]) {
                acc_count++;
                total_bal += acc["balance"].get<double>();
            }
        }
        user_data["accounts_count"] = acc_count;
        user_data["total_balance"] = total_bal;
        users_list.push_back(user_data);
    }
    res.set_content(users_list.dump(), "application/json");
}

void AdminService::getStats(const Request& req, Response& res) {
    Utils::setCors(res);
    std::string user_id = Utils::getUserId(req);
    if (user_id.empty()) { Utils::sendUnauthorized(res); return; }

    json db = m_db.load();
    int total_users = db["users"].size();
    int total_accounts = db["accounts"].size();
    int total_transactions = db["transactions"].size();
    double total_deposits = 0, total_withdrawals = 0, total_balance = 0;

    for (auto& txn : db["transactions"]) {
        if (txn["type"] == "credit")
            total_deposits += txn["amount"].get<double>();
        else
            total_withdrawals += txn["amount"].get<double>();
    }
    for (auto& acc : db["accounts"]) {
        total_balance += acc["balance"].get<double>();
    }

    json response = {
        {"total_users", total_users},
        {"total_accounts", total_accounts},
        {"total_transactions", total_transactions},
        {"total_deposits", total_deposits},
        {"total_withdrawals", total_withdrawals},
        {"total_balance", total_balance},
        {"active_loans", db["loans"].size()},
        {"total_investments", db["investments"].size()}
    };
    res.set_content(response.dump(), "application/json");
}

void AdminService::deleteUser(const Request& req, Response& res) {
    Utils::setCors(res);
    std::string user_id = Utils::getUserId(req);
    if (user_id.empty()) { Utils::sendUnauthorized(res); return; }

    std::string target_id = req.matches[1];
    json db = m_db.load();

    if (!isAdmin(user_id, db)) {
        Utils::sendError(res, 403, "Forbidden");
        return;
    }

    // Remove the target user
    auto& users = db["users"];
    users.erase(
        std::remove_if(users.begin(), users.end(),
            [&](const json& u) { return u["id"] == target_id; }),
        users.end());
    m_db.save(db);

    json response = {{"success", true}, {"message", "User deleted"}};
    res.set_content(response.dump(), "application/json");
}
