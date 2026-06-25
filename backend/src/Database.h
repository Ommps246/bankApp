#pragma once

#include "../include/json.hpp"
#include <string>
#include <mutex>

using json = nlohmann::json;

// ─── Thread-safe JSON Database ──────────────────────────
// Encapsulates all file I/O for the JSON-based database.
// All services share a single Database instance.
class Database {
public:
    // Construct with path to the JSON database file
    explicit Database(const std::string& dbPath);

    // Load and return the entire database (thread-safe)
    json load();

    // Save the entire database to disk (thread-safe)
    void save(const json& data);

private:
    std::string m_dbPath;
    std::mutex  m_mutex;
};
