#include <iostream>
#include <string>
using namespace std;

class BankAccount {
    private:
        string ownerName;
        int accountNumber;
        double balance;

    public:
        // Constructor to initialize the account
        BankAccount(string name, int accNum, double initialBalance) {
            ownerName = name;
            accountNumber = accNum;
            balance = initialBalance;
        }

        // Deposit money into the account
        void deposit(double amount) {
            if (amount <= 0) {
                cout << "❌ Invalid amount. Enter a positive value.\n";
                return;
            }
            balance += amount;
            cout << "✅ Deposited ₹" << amount << " | New Balance: ₹" << balance << "\n";
        }

        // Withdraw money from the account
        void withdraw(double amount) {
            if (amount <= 0) {
                cout << "❌ Invalid amount.\n";
                return;
            }
            if (amount > balance) {
                cout << "❌ Insufficient funds! Balance: ₹" << balance << "\n";
                return;
            }
            balance -= amount;
            cout << "✅ Withdrew ₹" << amount << " | New Balance: ₹" << balance << "\n";
        }

        // Display account information
        void checkBalance() {
            cout << "\n--- Account Details ---\n";
            cout << "Name        : " << ownerName << "\n";
            cout << "Account No. : " << accountNumber << "\n";
            cout << "Balance     : ₹" << balance << "\n";
            cout << "-----------------------\n";
        }
};

int main() {
    string name;
    double openingBalance;

    cout << "============================\n";
    cout << "   Welcome to MyBank 🏦     \n";
    cout << "============================\n";
    cout << "Enter your name: ";
    cin >> name;
    cout << "Enter opening balance (₹): ";
    cin >> openingBalance;

    BankAccount myAccount(name, 1001, openingBalance);
    cout << "\n✅ Account created successfully! Account No: 1001\n";

    int choice;
    double amount;

    while (true) {
        cout << "\n======= MENU =======\n";
        cout << "1. Deposit Money\n";
        cout << "2. Withdraw Money\n";
        cout << "3. Check Balance\n";
        cout << "4. Exit\n";
        cout << "====================\n";
        cout << "Enter your choice: ";
        cin >> choice;

        if (choice == 1) {
            cout << "Enter amount to deposit: ₹";
            cin >> amount;
            myAccount.deposit(amount);
        } else if (choice == 2) {
            cout << "Enter amount to withdraw: ₹";
            cin >> amount;
            myAccount.withdraw(amount);
        } else if (choice == 3) {
            myAccount.checkBalance();
        } else if (choice == 4) {
            cout << "\n👋 Thank you for banking with us! Goodbye!\n";
            break;
        } else {
            cout << "❌ Invalid choice. Please pick 1–4.\n";
        }
    }

    return 0;
}