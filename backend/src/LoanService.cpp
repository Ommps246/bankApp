#include "LoanService.h"
#include <cmath>
#include <algorithm>

LoanService::LoanService(Database& db)
    : m_db(db) {}

void LoanService::getLoans(const Request& req, Response& res) {
    Utils::setCors(res);
    std::string user_id = Utils::getUserId(req);
    if (user_id.empty()) { Utils::sendUnauthorized(res); return; }

    json db = m_db.load();
    json user_loans = json::array();
    for (auto& loan : db["loans"]) {
        if (loan["user_id"] == user_id) {
            user_loans.push_back(loan);
        }
    }
    res.set_content(user_loans.dump(), "application/json");
}

void LoanService::applyLoan(const Request& req, Response& res) {
    Utils::setCors(res);
    std::string user_id = Utils::getUserId(req);
    if (user_id.empty()) { Utils::sendUnauthorized(res); return; }

    try {
        auto body = json::parse(req.body);
        double principal = body["principal"].get<double>();
        double annual_rate = body["rate"].get<double>();
        int tenure_months = body["tenure_months"].get<int>();
        std::string loan_type = body.value("loan_type", "Personal Loan");
        std::string loan_name = body.value("name", loan_type);

        double monthly_rate = annual_rate / 12.0 / 100.0;
        double emi = principal * monthly_rate *
            std::pow(1 + monthly_rate, tenure_months) /
            (std::pow(1 + monthly_rate, tenure_months) - 1);

        json db = m_db.load();
        std::string loan_id = Utils::generateId("loan");
        json new_loan = {
            {"id", loan_id},
            {"user_id", user_id},
            {"type", loan_type},
            {"name", loan_name},
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
    } catch (std::exception& e) {
        Utils::sendError(res, 400, e.what());
    }
}

void LoanService::calculateEMI(const Request& req, Response& res) {
    Utils::setCors(res);
    try {
        auto body = json::parse(req.body);
        double principal = body["principal"];
        double annual_rate = body["rate"];
        int tenure_months = body["tenure_months"];

        double monthly_rate = annual_rate / 12.0 / 100.0;
        double emi = principal * monthly_rate *
            std::pow(1 + monthly_rate, tenure_months) /
            (std::pow(1 + monthly_rate, tenure_months) - 1);
        double total_payment = emi * tenure_months;
        double total_interest = total_payment - principal;

        // Generate amortization schedule (first 12 months)
        json schedule = json::array();
        double remaining = principal;
        for (int i = 1; i <= std::min(tenure_months, 12); i++) {
            double interest_part = remaining * monthly_rate;
            double principal_part = emi - interest_part;
            remaining -= principal_part;
            schedule.push_back({
                {"month", i},
                {"emi", std::round(emi * 100) / 100},
                {"principal", std::round(principal_part * 100) / 100},
                {"interest", std::round(interest_part * 100) / 100},
                {"remaining", std::round(remaining * 100) / 100}
            });
        }

        json response = {
            {"emi", std::round(emi * 100) / 100},
            {"total_payment", std::round(total_payment * 100) / 100},
            {"total_interest", std::round(total_interest * 100) / 100},
            {"schedule", schedule}
        };
        res.set_content(response.dump(), "application/json");
    } catch (std::exception& e) {
        Utils::sendError(res, 400, e.what());
    }
}
