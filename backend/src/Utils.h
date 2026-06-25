#pragma once

#include "../include/httplib.h"
#include "../include/json.hpp"
#include <string>
#include <ctime>
#include <sstream>
#include <iomanip>

using json = nlohmann::json;
using namespace httplib;

// ─── Static Utility Class ───────────────────────────────
class Utils {
public:
    // Generate a unique ID with a given prefix (e.g. "usr", "acc", "txn")
    static std::string generateId(const std::string& prefix) {
        static int counter = 100;
        counter++;
        return prefix + "_" + std::to_string(counter);
    }

    // Get current date formatted as YYYY-MM-DD
    static std::string currentDate() {
        auto t = std::time(nullptr);
        auto tm = *std::localtime(&t);
        std::ostringstream oss;
        oss << std::put_time(&tm, "%Y-%m-%d");
        return oss.str();
    }

    // Base64 encode a string (used for simple token generation)
    static std::string base64Encode(const std::string& in) {
        static const char* chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        std::string out;
        int val = 0, valb = -6;
        for (unsigned char c : in) {
            val = (val << 8) + c;
            valb += 8;
            while (valb >= 0) {
                out.push_back(chars[(val >> valb) & 0x3F]);
                valb -= 6;
            }
        }
        if (valb > -6) out.push_back(chars[((val << 8) >> (valb + 8)) & 0x3F]);
        while (out.size() % 4) out.push_back('=');
        return out;
    }

    // Base64 decode a string (used for token extraction)
    static std::string base64Decode(const std::string& in) {
        static const int T[256] = {
            -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
            -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
            -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,62,-1,-1,-1,63,
            52,53,54,55,56,57,58,59,60,61,-1,-1,-1,-1,-1,-1,
            -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12,13,14,
            15,16,17,18,19,20,21,22,23,24,25,-1,-1,-1,-1,-1,
            -1,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,
            41,42,43,44,45,46,47,48,49,50,51,-1,-1,-1,-1,-1
        };
        std::string out;
        int val = 0, valb = -8;
        for (unsigned char c : in) {
            if (T[c] == -1) break;
            val = (val << 6) + T[c];
            valb += 6;
            if (valb >= 0) {
                out.push_back(char((val >> valb) & 0xFF));
                valb -= 8;
            }
        }
        return out;
    }

    // Extract user ID from the Authorization header bearer token
    static std::string getUserId(const Request& req) {
        std::string auth = req.get_header_value("Authorization");
        if (auth.substr(0, 7) == "Bearer ") {
            return base64Decode(auth.substr(7));
        }
        return "";
    }

    // Set CORS headers on a response
    static void setCors(Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    // Send a JSON error response with a given status code
    static void sendError(Response& res, int status, const std::string& message) {
        json err = {{"success", false}, {"message", message}};
        res.status = status;
        res.set_content(err.dump(), "application/json");
    }

    // Send a 401 Unauthorized response
    static void sendUnauthorized(Response& res) {
        sendError(res, 401, "Unauthorized");
    }
};
