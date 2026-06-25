#include "InvestmentService.h"

InvestmentService::InvestmentService(Database& db)
    : m_db(db) {}

void InvestmentService::getInvestments(const Request& req, Response& res) {
    Utils::setCors(res);
    std::string user_id = Utils::getUserId(req);
    if (user_id.empty()) { Utils::sendUnauthorized(res); return; }

    json db = m_db.load();
    json user_inv = json::array();
    double total_invested = 0, total_current = 0;

    for (auto& inv : db["investments"]) {
        if (inv["user_id"] == user_id) {
            double invested = inv["shares"].get<double>() * inv["buy_price"].get<double>();
            double current = inv["shares"].get<double>() * inv["current_price"].get<double>();
            total_invested += invested;
            total_current += current;

            json item = inv;
            item["invested_value"] = invested;
            item["current_value"] = current;
            item["gain_loss"] = current - invested;
            item["gain_loss_pct"] = ((current - invested) / invested) * 100.0;
            user_inv.push_back(item);
        }
    }

    json response = {
        {"investments", user_inv},
        {"total_invested", total_invested},
        {"total_current", total_current},
        {"total_gain_loss", total_current - total_invested},
        {"total_gain_loss_pct", total_invested > 0
            ? ((total_current - total_invested) / total_invested) * 100.0
            : 0}
    };
    res.set_content(response.dump(), "application/json");
}

void InvestmentService::createInvestment(const Request& req, Response& res) {
    Utils::setCors(res);
    std::string user_id = Utils::getUserId(req);
    if (user_id.empty()) { Utils::sendUnauthorized(res); return; }

    try {
        auto body = json::parse(req.body);
        json db = m_db.load();
        json new_inv = {
            {"id", Utils::generateId("inv")},
            {"user_id", user_id},
            {"symbol", body["symbol"]},
            {"name", body["name"]},
            {"shares", body["shares"]},
            {"buy_price", body["buy_price"]},
            {"current_price", body["buy_price"]},
            {"type", body.value("type", "stock")}
        };
        db["investments"].push_back(new_inv);
        m_db.save(db);

        res.set_content(new_inv.dump(), "application/json");
    } catch (std::exception& e) {
        Utils::sendError(res, 400, e.what());
    }
}
