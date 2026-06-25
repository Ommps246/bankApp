#include "AuthService.h"
#include <cstdlib>

AuthService::AuthService(Database& db)
    : m_db(db) {}

void AuthService::login(const Request& req, Response& res) {
    Utils::setCors(res);
    try {
        auto body = json::parse(req.body);
        std::string username = body["username"];
        std::string password = body["password"];

        json db = m_db.load();
        for (auto& user : db["users"]) {
            if (user["username"] == username && user["password"] == password) {
                std::string token = Utils::base64Encode(user["id"].get<std::string>());
                json response = {
                    {"success", true},
                    {"token", token},
                    {"user", {
                        {"id", user["id"]},
                        {"name", user["name"]},
                        {"email", user["email"]},
                        {"role", user["role"]},
                        {"avatar", user["avatar"]}
                    }}
                };
                res.set_content(response.dump(), "application/json");
                return;
            }
        }
        Utils::sendError(res, 401, "Invalid credentials");
    } catch (std::exception& e) {
        Utils::sendError(res, 400, e.what());
    }
}

void AuthService::registerUser(const Request& req, Response& res) {
    Utils::setCors(res);
    try {
        auto body = json::parse(req.body);
        json db = m_db.load();

        // Check if username already exists
        for (auto& user : db["users"]) {
            if (user["username"] == body["username"]) {
                Utils::sendError(res, 409, "Username already exists");
                return;
            }
        }

        std::string user_id = Utils::generateId("usr");
        std::string name = body.value("name", body["username"].get<std::string>());
        json new_user = {
            {"id", user_id},
            {"username", body["username"]},
            {"password", body["password"]},
            {"name", name},
            {"email", body.value("email", "")},
            {"role", "user"},
            {"avatar", std::string(1, name[0]) +
                (name.find(' ') != std::string::npos
                    ? std::string(1, name[name.find(' ') + 1])
                    : "")},
            {"created_at", Utils::currentDate()}
        };
        db["users"].push_back(new_user);

        // Create default savings account for new user
        std::string acc_id = Utils::generateId("acc");
        json new_acc = {
            {"id", acc_id},
            {"user_id", user_id},
            {"type", "savings"},
            {"name", "Primary Savings"},
            {"balance", 1000.00},
            {"currency", "USD"},
            {"account_number", "****" + std::to_string(rand() % 9000 + 1000)},
            {"created_at", Utils::currentDate()}
        };
        db["accounts"].push_back(new_acc);
        m_db.save(db);

        std::string token = Utils::base64Encode(user_id);
        json response = {
            {"success", true},
            {"token", token},
            {"user", {
                {"id", user_id},
                {"name", name},
                {"email", body.value("email", "")},
                {"role", "user"},
                {"avatar", new_user["avatar"]}
            }}
        };
        res.set_content(response.dump(), "application/json");
    } catch (std::exception& e) {
        Utils::sendError(res, 400, e.what());
    }
}
