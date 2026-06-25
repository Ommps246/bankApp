#include "AccountService.h"
#include <cstdlib>
#include <cmath>

AccountService::AccountService(Database& db)
    : m_db(db) {}

void AccountService::getAccounts(const Request& req, Response& res) {
    Utils::setCors(res);
    std::string user_id = Utils::getUserId(req);
    if (user_id.empty()) { Utils::sendUnauthorized(res); return; }

    json db = m_db.load();
    json user_accounts = json::array();
    for (auto& acc : db["accounts"]) {
        if (acc["user_id"] == user_id) {
            user_accounts.push_back(acc);
        }
    }
    res.set_content(user_accounts.dump(), "application/json");
}

void AccountService::createAccount(const Request& req, Response& res) {
    Utils::setCors(res);
    std::string user_id = Utils::getUserId(req);
    if (user_id.empty()) { Utils::sendUnauthorized(res); return; }

    try {
        auto body = json::parse(req.body);
        json db = m_db.load();
        std::string acc_type = body.value("type", "savings");

        // ── Handle Loan account creation ──
        if (acc_type == "loan" && body.contains("loan_details")) {
            auto& ld = body["loan_details"];
            double principal = ld["principal"].get<double>();
            double annual_rate = ld["rate"].get<double>();
            int tenure_months = ld["tenure_months"].get<int>();
            double monthly_rate = annual_rate / 12.0 / 100.0;
            double emi = principal * monthly_rate *
                std::pow(1 + monthly_rate, tenure_months) /
                (std::pow(1 + monthly_rate, tenure_months) - 1);

            std::string loan_id = Utils::generateId("loan");
            json new_loan = {
                {"id", loan_id},
                {"user_id", user_id},
                {"type", ld.value("loan_type", "Personal Loan")},
                {"principal", principal},
                {"remaining", principal},
                {"rate", annual_rate},
                {"tenure_months", tenure_months},
                {"emi", std::round(emi * 100) / 100},
                {"status", "active"},
                {"start_date", Utils::currentDate()},
                {"created_at", Utils::currentDate()}
            };

            if (!db.contains("loans")) { db["loans"] = json::array(); }
            db["loans"].push_back(new_loan);
            m_db.save(db);

            res.set_content(new_loan.dump(), "application/json");
            return;
        }

        // ── Standard account creation (savings / checking / business) ──
        std::string acc_id = Utils::generateId("acc");
        json new_acc = {
            {"id", acc_id},
            {"user_id", user_id},
            {"type", acc_type},
            {"name", body.value("name", "New Account")},
            {"balance", 0.0},
            {"currency", "USD"},
            {"account_number", "****" + std::to_string(rand() % 9000 + 1000)},
            {"created_at", Utils::currentDate()}
        };
        db["accounts"].push_back(new_acc);
        m_db.save(db);

        res.set_content(new_acc.dump(), "application/json");
    } catch (std::exception& e) {
        Utils::sendError(res, 400, e.what());
    }
}

void AccountService::transfer(const Request& req, Response& res) {
    Utils::setCors(res);
    std::string user_id = Utils::getUserId(req);
    if (user_id.empty()) { Utils::sendUnauthorized(res); return; }

    try {
        auto body = json::parse(req.body);
        std::string from_id = body["from_account"];
        std::string to_id = body["to_account"];
        double amount = body["amount"];
        std::string description = body.value("description", "Fund Transfer");

        json db = m_db.load();

        // Find source and destination accounts
        json* from_acc = nullptr;
        json* to_acc = nullptr;
        for (auto& acc : db["accounts"]) {
            if (acc["id"] == from_id) from_acc = &acc;
            if (acc["id"] == to_id) to_acc = &acc;
        }

        if (!from_acc || !to_acc) {
            Utils::sendError(res, 404, "Account not found");
            return;
        }

        double balance = (*from_acc)["balance"].get<double>();
        if (balance < amount) {
            Utils::sendError(res, 400, "Insufficient funds");
            return;
        }

        // Perform the transfer
        (*from_acc)["balance"] = balance - amount;
        (*to_acc)["balance"] = (*to_acc)["balance"].get<double>() + amount;

        // Create debit transaction record
        json txn_debit = {
            {"id", Utils::generateId("txn")},
            {"user_id", user_id},
            {"account_id", from_id},
            {"type", "debit"},
            {"amount", amount},
            {"description", description},
            {"category", "transfer"},
            {"date", Utils::currentDate()},
            {"status", "completed"}
        };

        // Create credit transaction record
        json txn_credit = {
            {"id", Utils::generateId("txn")},
            {"user_id", (*to_acc)["user_id"]},
            {"account_id", to_id},
            {"type", "credit"},
            {"amount", amount},
            {"description", "Transfer from " + from_id},
            {"category", "transfer"},
            {"date", Utils::currentDate()},
            {"status", "completed"}
        };

        db["transactions"].push_back(txn_debit);
        db["transactions"].push_back(txn_credit);
        m_db.save(db);

        json response = {
            {"success", true},
            {"message", "Transfer completed successfully"},
            {"transaction", txn_debit}
        };
        res.set_content(response.dump(), "application/json");
    } catch (std::exception& e) {
        Utils::sendError(res, 400, e.what());
    }
}
