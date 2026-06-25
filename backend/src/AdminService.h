#pragma once

#include "Database.h"
#include "Utils.h"

// ─── Admin Service ─────────────────────────────────────
// Handles admin-only operations: user management and system stats.
class AdminService {
public:
    explicit AdminService(Database& db);

    // GET /api/admin/users — list all users with account summaries (admin only)
    void getUsers(const Request& req, Response& res);

    // GET /api/admin/stats — system-wide statistics (admin only)
    void getStats(const Request& req, Response& res);

    // DELETE /api/admin/users/:id — delete a user (admin only)
    void deleteUser(const Request& req, Response& res);

private:
    Database& m_db;

    // Check if the requesting user has admin privileges
    bool isAdmin(const std::string& user_id, const json& db);
};
