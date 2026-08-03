# User Manual - Finance Manager

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Uploading Bank Statements](#uploading-bank-statements)
4. [Managing Transactions](#managing-transactions)
5. [Categories and Budgets](#categories-and-budgets)
6. [Analytics and Insights](#analytics-and-insights)
7. [Security Features](#security-features)
8. [Tips and Tricks](#tips-and-tricks)
9. [FAQ](#faq)

---

## Getting Started

### First Time Setup

1. **Open the Application**
   - Navigate to `http://localhost:5173` in your web browser
   - You'll see the Finance Manager dashboard

2. **Familiarize Yourself**
   - The dashboard shows your monthly overview
   - Navigation menu is on the left sidebar
   - Quick stats appear at the top

### Main Navigation

- **Dashboard** - Overview of your finances
- **Transactions** - View and manage individual transactions
- **Categories** - Set up and customize spending categories
- **Analytics** - View detailed reports and trends
- **Settings** - Preferences and security options

---

## Dashboard Overview

The dashboard is your at-a-glance view of your finances.

### Dashboard Components

1. **Summary Cards**
   - **Total Income** - All money coming in
   - **Total Expenses** - All money going out
   - **Net Cash Flow** - Income minus expenses
   - **Transaction Count** - How many transactions this month

2. **Spending by Category (Pie Chart)**
   - Visual breakdown of where your money goes
   - Click on a slice to see details
   - Hover for percentages

3. **Monthly Trend (Line Graph)**
   - See how spending changes over time
   - Compare current month vs previous months
   - Identify spending patterns

4. **Top Spending Categories**
   - Your 5 largest spending categories
   - Quick alerts if spending is unusual

5. **Quick Actions**
   - Upload statement button (top right)
   - Filter by date range
   - Switch between month/quarter/year views

### Using the Dashboard

**Change Time Period:**
- Use the date selector at the top
- Select: Month, Quarter, or Year view
- Navigate between periods with arrow buttons

**Drill Down:**
- Click any category in the pie chart
- See all transactions in that category
- Filter by date range within the category

---

## Uploading Bank Statements

### Supported File Formats

✅ **CSV** - Most common format from banks
✅ **Excel (.xlsx)** - Formatted spreadsheets
❌ **PDF** - Coming soon (in development)

### Before You Upload

1. **Download from Your Bank**
   - Log into your bank's website
   - Find "Statements" or "Transactions" section
   - Download in CSV or Excel format
   - Typical file names: `statement_jan2024.csv`

2. **Review the File** (Optional)
   - Open in Excel or text editor
   - Confirm it contains: Date, Amount, Description columns
   - Remove any header/footer rows if needed

### How to Upload

1. **Click Upload Button**
   - Look for "Upload Statement" in dashboard
   - Or use menu: Transactions → Upload

2. **Select File**
   - Click "Choose File" or drag-and-drop
   - Select your bank statement
   - File size limit: 50 MB

3. **Set Security (Optional)**
   - Check "Password Protect" to secure the file
   - Enter a password (you'll need it to access)
   - Choose "Encrypt File" for extra security

4. **Review and Confirm**
   - System shows preview of detected transactions
   - Check for any errors
   - Click "Confirm Upload"

5. **Processing**
   - Application processes the file
   - Transactions are auto-categorized
   - You'll get a summary report
   - Takes 5-30 seconds depending on file size

### After Upload

You'll see:
- ✅ Number of transactions imported
- ✅ Number of duplicates detected (if any)
- ✅ Any parsing errors
- ✅ Preview of first few transactions

**Next Steps:**
- Review and correct categorizations
- Edit transaction descriptions if needed
- Set up budgets for categories

---

## Managing Transactions

### Viewing Transactions

1. **Transaction List**
   - Go to: Transactions menu
   - Shows all transactions in your account
   - Sorted by date (newest first)

2. **Columns Displayed**
   - **Date** - When transaction occurred
   - **Description** - What was the transaction
   - **Merchant** - Who you paid
   - **Category** - Type of expense/income
   - **Amount** - How much

3. **Search and Filter**
   - **Search Box** - Find by description or merchant
   - **Category Filter** - Show only one category
   - **Date Range** - Specify start and end dates
   - **Amount Range** - Find expensive transactions
   - **Type Filter** - Expense, Income, or Transfer

### Editing a Transaction

1. **Click on Transaction**
   - Find the transaction in the list
   - Click to open details

2. **Edit Details**
   - Change the category
   - Update description
   - Adjust amount (if incorrect)
   - Add notes
   - Add tags for custom grouping

3. **Save Changes**
   - Click "Save" button
   - Changes are saved immediately

### Categorizing Transactions

**Manual Categorization:**
- Open transaction
- Click on "Category" dropdown
- Select appropriate category
- Save

**Bulk Categorization:**
- Select multiple transactions
- Click "Categorize"
- Select category
- Apply to all selected

### Categories Available

Default categories:
- 🛒 **Groceries** - Food and household items
- 💡 **Utilities** - Electricity, water, gas
- 🚗 **Transportation** - Gas, parking, public transport
- 🎮 **Entertainment** - Movies, games, hobbies
- 💊 **Healthcare** - Medical expenses, pharmacy
- 🏠 **Housing** - Rent, mortgage, home repairs
- 🍽️ **Dining** - Restaurants, cafes
- 🛍️ **Shopping** - Clothes, online shopping
- 📱 **Subscriptions** - Monthly memberships
- 📌 **Other** - Miscellaneous expenses

---

## Categories and Budgets

### Managing Categories

1. **View Categories**
   - Go to: Categories menu
   - See all your spending categories

2. **Edit Category**
   - Click on category name
   - Change color (for charts)
   - Update matching keywords
   - Set or modify budget limit

3. **Create Custom Category**
   - Click "New Category"
   - Enter name (e.g., "Coffee Shops")
   - Add matching keywords (coffee, café, starbucks)
   - Set budget limit (optional)
   - Choose a color

### Setting Budgets

1. **Set Budget for Category**
   - Click on category
   - Enter "Monthly Budget" amount
   - Click Save

2. **Monitor Budget**
   - Dashboard shows budget vs actual
   - Visual indicator: Green (under), Yellow (near limit), Red (over)
   - Get alerts when approaching limit

3. **Budget Tips**
   - Start with average of last 3 months
   - Gradually reduce if you want to save more
   - Adjust seasonally (holidays cost more)

---

## Analytics and Insights

### Monthly Summary

1. **View Monthly Report**
   - Go to: Analytics → Monthly
   - Select month/year
   - See complete summary

2. **Information Shown**
   - Total income vs expenses
   - Net cash flow (profit/loss)
   - Number of transactions
   - Spending breakdown by category
   - Largest transaction

### Yearly Analysis

1. **Yearly Report**
   - Analytics → Yearly
   - Select year
   - See 12-month comparison

2. **Insights**
   - Average monthly spending
   - Best month (lowest spending)
   - Worst month (highest spending)
   - Trends over time

### Category Trends

1. **Track Category Spending**
   - Analytics → Trends
   - Select category
   - View last 6 months

2. **Find Patterns**
   - Is spending increasing or decreasing?
   - How does it compare to average?
   - Identify highest/lowest months

### Smart Insights

The app generates automatic insights:
- **Alerts** - "You're spending 25% more this month"
- **Patterns** - "Your top 3 categories are..."
- **Opportunities** - "You have 5 recurring expenses"
- **Recommendations** - "Set a budget for Dining"

---

## Security Features

### Password-Protecting Uploads

**Why protect statements?**
- Bank statements contain sensitive information
- Passwords prevent accidental sharing
- Encryption secures data

**How to Use:**

1. When uploading: Check "Password Protect"
2. Enter a strong password
3. Password is hashed (encrypted) in database
4. Next time accessing: Must enter password
5. Never share passwords!

### File Encryption

**For Extra Security:**
- Check "Encrypt File" option
- File is encrypted using industry-standard Fernet encryption
- Even system admins can't see raw data
- Password + encryption = double protection

### Audit Log

**Track Who Accessed Files:**
- Settings → Security → Audit Log
- See when files were accessed
- See if decryption succeeded/failed
- Useful for security monitoring

### Best Practices

1. **Strong Passwords**
   - Use mix of uppercase, lowercase, numbers, symbols
   - At least 12 characters
   - Don't reuse passwords

2. **Protect Uploads**
   - Always password protect bank statements
   - Use encryption for extra sensitive statements
   - Review audit logs regularly

3. **Storage**
   - Don't share passwords via email
   - Don't write passwords in files
   - Use password manager

---

## Tips and Tricks

### Organizing Transactions

1. **Use Tags**
   - Add custom tags to transactions
   - Tag: "personal", "business", "reimbursable"
   - Filter by tags later

2. **Add Notes**
   - Document unusual transactions
   - Note reasons for large expenses
   - Help future-you understand spending

3. **Merchant Matching**
   - System tries to identify merchant
   - Edit if incorrect
   - Helps with analysis

### Maximizing Analytics

1. **Upload Regularly**
   - Monthly is ideal
   - Don't let months pile up
   - System needs history for trends

2. **Categorize Consistently**
   - Same merchant = same category
   - Set up matching keywords
   - Accurate categories = accurate insights

3. **Review Insights**
   - Check insights weekly/monthly
   - Act on recommendations
   - Track progress toward goals

### Export and Share

1. **Generate Reports**
   - Analytics → Export
   - Choose format (PDF, CSV, JSON)
   - Send to accountant/advisor

2. **Share with Others**
   - Export anonymized report (no amounts shown)
   - Share insight summaries
   - Plan together with family

---

## FAQ

### "How do I delete a transaction?"
Open transaction → Click "Delete" → Confirm. Cannot be undone, so be careful!

### "Can I merge duplicate transactions?"
Coming soon! For now, delete duplicates manually or ignore them.

### "How far back does history go?"
As far as you've uploaded. Start uploading old statements to build complete history.

### "Can I categorize multiple transactions at once?"
Yes! Select multiple transactions → Click "Bulk Categorize" → Select category → Apply

### "What if I upload the same statement twice?"
System detects duplicates and warns you. You can skip or overwrite.

### "How accurate is the auto-categorization?"
~95% accurate for initial categorization. Review and correct as needed. System learns from corrections.

### "Is my data safe?"
Yes! All data is encrypted and password-protected. Never stored in plain text. Regular security audits recommended.

### "Can I change categories after uploading?"
Yes! Go to Categories and rename/edit anytime. All transactions update automatically.

### "How do I set a family budget?"
Coming in Phase 2. For now, share access to account or share reports.

### "Can I connect my bank directly?"
Coming soon! Real-time sync will be available in Phase 3.

### "Is there a mobile app?"
Coming soon! Phase 3 development will include iOS/Android apps.

### "How do I export data?"
Analytics → Export → Choose format (PDF, CSV, or JSON)

### "What if I have a bug/issue?"
Check documentation or contact support. Always provide:
- Error message
- Steps to reproduce
- File format (if upload-related)

---

## Getting Help

### Need More Information?

- **Developer Guide** - [docs/dev-docs/](../dev-docs/) (Technical details)
- **Architecture** - [docs/dev-docs/ARCHITECTURE.md](../dev-docs/ARCHITECTURE.md)
- **Security** - [docs/dev-docs/SECURITY.md](../dev-docs/SECURITY.md)
- **Database** - [docs/dev-docs/DATABASE.md](../dev-docs/DATABASE.md)

### Tips for Success

1. ✅ Upload statements monthly
2. ✅ Review and correct categories
3. ✅ Set budgets for categories
4. ✅ Check insights regularly
5. ✅ Update notes on large expenses

---

**Happy tracking! 💰**

*For questions or feedback, refer to documentation or check the main README.md*
