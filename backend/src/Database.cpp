#include "Database.h"
#include <fstream>
#include <iostream>

Database::Database(const std::string& dbPath)
    : m_dbPath(dbPath) {}

json Database::load() {
    std::lock_guard<std::mutex> lock(m_mutex);
    std::ifstream f(m_dbPath);
    if (!f.is_open()) {
        std::cerr << "Error: Cannot open " << m_dbPath << std::endl;
        return json::object();
    }
    json data;
    f >> data;
    return data;
}

void Database::save(const json& data) {
    std::lock_guard<std::mutex> lock(m_mutex);
    std::ofstream f(m_dbPath);
    f << data.dump(2);
}
