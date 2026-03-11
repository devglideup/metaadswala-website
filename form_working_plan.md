# MetaAds Form Integration Plan

This document outlines the steps to make your contact forms fully functional using Google Apps Script. This solution will allow you to:
1.  **Capture Form Data:** Save all submissions to a Google Sheet.
2.  **Send Notifications:** Receive instant email alerts for new leads.
3.  **Handle Responses:** Show success/error messages on your website without page reloads.

## Prerequisites
- A Google Account (Gmail).
- Access to the `MetaAds` website codebase.

---

## Phase 1: Google Sheet & Apps Script Setup

1.  **Create a Google Sheet:**
    - Go to [Google Sheets](https://sheets.google.com).
    - Create a new blank spreadsheet.
    - Name it `MetaAds Leads`.

2.  **Open Apps Script:**
    - In your new spreadsheet, go to `Extensions` > `Apps Script`.
    - This will open a new tab with the Apps Script code editor.

3.  **Paste the Code:**
    - Delete any code currently in the `Code.gs` file.
    - Copy and paste the following code (provided by you):

```javascript
// ============================================
// MetaAds Form Submission Handler
// ============================================

const NOTIFICATION_EMAIL = "dev.glideup@gmail.com";
const EMAIL_SUBJECT = "🎯 New Lead - MetaAds";
const SHEET_NAME = "Form Submissions";

function doPost(e) {
  try {
    const data = e.parameter;
    
    // This works because script is bound to this spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["Timestamp", "Source", "Company Name", "Name", "Phone", "Website", "Service"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#4285f4").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }
    
    const timestamp = new Date().toLocaleString("en-IN", {timeZone: "Asia/Kolkata"});
    
    sheet.appendRow([
      timestamp,
      data.source || "Unknown",
      data.company_name || "",
      data.name || "",
      data.phone || "",
      data.website || "",
      data.service || ""
    ]);
    
    MailApp.sendEmail({
      to: NOTIFICATION_EMAIL,
      subject: `${EMAIL_SUBJECT} - ${data.company_name || data.name}`,
      body: `🎯 NEW LEAD\n\n📅 ${timestamp}\n📍 ${data.source}\n\n🏢 Company: ${data.company_name}\n👤 Name: ${data.name}\n📞 Phone: ${data.phone}\n🌐 Website: ${data.website}\n📦 Service: ${data.service}\n\nView: ${ss.getUrl()}`
    });
    
    return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({status: "active", message: "MetaAds Form Handler ready"})).setMimeType(ContentService.MimeType.JSON);
}
```

4.  **Save the Script:**
    - Click the floppy disk icon or press `Ctrl + S`.
    - Name the project "MetaAds Form Handler".

---

## Phase 2: Deployment

**Critical Step:** You must deploy the script correctly for it to work with your website.

1.  Click the blue **Deploy** button (top right).
2.  Select **New deployment**.
3.  Click the gear icon (Select type) next to "Select type" and choose **Web app**.
4.  **Configuration:**
    - **Description:** `Initial deployment`
    - **Execute as:** `Me` (your email address)
    - **Who has access:** `Anyone` (This is crucial so your website visitors can submit the form without logging in).
5.  Click **Deploy**.
6.  **Authorize Access:**
    - You will be asked to authorize access. Click "Review permissions".
    - Select your Google account.
    - If you see a warning "Google hasn't verified this app", click **Advanced** (bottom left) and then **Go to MetaAds Form Handler (unsafe)**.
    - Click **Allow**.
7.  **Copy the Web App URL:**
    - You will see a "Web App URL" starting with `https://script.google.com/macros/s/...`.
    - **Copy this URL.** You will need it in the next phase.

---

## Phase 3: Frontend Integration

Now we need to connect your website forms to this newly deployed script.

1.  **Open your project files.**
2.  **Locate `js/script.js`.**
3.  **Update the `FORM_ENDPOINT` variable:**
    - Find the line `const FORM_ENDPOINT = '...';` (Line 156).
    - Replace the existing URL with the **Web App URL** you copied in Phase 2.

```javascript
// Example in js/script.js
const FORM_ENDPOINT = 'https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID/exec'; 
```

4.  **Save the file.**

---

## Phase 4: Testing

1.  Open your website (locally or live).
2.  Fill out the **Hero Form** (top of page), **Contact Page Form**, or **Homepage Contact Section Form**.
3.  Click **Submit**.
4.  **Verification:**
    - **Website:** You should see the button change to "Success!" and be redirected to the Thank You page.
    - **Google Sheet:** You should see a new row with the data you entered.
    - **Email:** Check `dev.glideup@gmail.com` for the notification email.

## Troubleshooting

-   **CORS Errors:** Google Apps Script redirects responses. If you see CORS errors in the console but the data *is* arriving in the Sheet, it means the browser is blocking the redirect response reading. However, the provided code uses a robust `fetch` method. If issues persist, verify that "Who has access" is set to "Anyone".
-   **No Data in Sheet:** Ensure you clicked "Authorize" during deployment. If you need to re-authorize, just deploy a "New version".
-   **Fields Missing:** Ensure the `name="..."` attributes in your HTML forms match exactly: `company_name`, `name`, `phone`, `website`, `service`. (We have verified the current codebase matches these).

