# 📝 NotesDrop — Notes Upload & Download Website

A beautiful, free notes sharing website where students can upload study notes via **Google Forms** (files go to **one shared Google Drive folder**) and anyone can browse & download them. **No API keys needed!**

---

## 🚀 Quick Setup Guide

### Step 1: Create the Google Form

1. Go to [Google Forms](https://forms.google.com) and create a new form
2. Add these fields **in this exact order**:
   
   | # | Field Name | Field Type | Required? |
   |---|-----------|-----------|-----------|
   | 1 | Your Name | Short answer | Optional |
   | 2 | Subject | Dropdown (or Short answer) | Yes |
   | 3 | Title / Topic | Short answer | Yes |
   | 4 | Description | Paragraph | Optional |
   | 5 | Upload File | **File upload** | Yes |

3. For the **File Upload** field:
   - Click the file upload option
   - Google will ask you to allow file uploads → Accept
   - Set allowed file types: PDF, Documents, Images, etc.
   - **All uploaded files automatically go to ONE Google Drive folder** (Google creates this folder for you)

4. Make sure the Drive folder is **shared publicly**:
   - Go to Google Drive
   - Find the folder named like "Your Form Name (File responses)"
   - Right-click → Share → Change to **"Anyone with the link"** → **Viewer**

### Step 2: Link Form to Google Sheet

1. In your Google Form, go to the **Responses** tab
2. Click the **Google Sheets** icon (📊) → "Create a new spreadsheet"
3. This creates a linked Google Sheet that auto-updates with every form submission

### Step 3: Publish the Google Sheet

1. Open the linked Google Sheet
2. Go to **File → Share → Publish to web**
3. Select **Entire Document** → **CSV**
4. Click **Publish** → Confirm
5. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```
   The Sheet ID is the long string between `/d/` and `/edit`

### Step 4: Get Your Form Embed URL

1. In Google Forms, click **Send** (top-right)
2. Click the **embed icon** (<>)
3. Copy the `src` URL from the iframe code, it looks like:
   ```
   https://docs.google.com/forms/d/e/1FAIpQLSe.../viewform?embedded=true
   ```
4. Also copy the direct form URL (without `?embedded=true`)

### Step 5: Configure the Website

Open `script.js` and update the `CONFIG` object at the top:

```javascript
const CONFIG = {
    SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE',
    FORM_EMBED_URL: 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true',
    FORM_DIRECT_URL: 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform',
    // ... column mapping stays the same unless you changed the field order
};
```

### Step 6: Deploy!

This is a **static website** — no server needed! You can deploy it for free on:

- **GitHub Pages**: Push to a repo, enable Pages in settings
- **Netlify**: Drag & drop the folder at [netlify.com/drop](https://app.netlify.com/drop)
- **Vercel**: Import the repo at [vercel.com](https://vercel.com)
- **Just open locally**: Double-click `index.html` to preview

---

## 📁 How It Works (Technical)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Student     │────▶│ Google Form  │────▶│ Google Drive  │
│  uploads     │     │ (embedded)   │     │ (single folder)│
│  notes       │     └──────┬───────┘     └──────────────┘
└─────────────┘            │
                           ▼
                    ┌──────────────┐     ┌──────────────┐
                    │ Google Sheet │◀────│ Auto-linked   │
                    │ (published)  │     │ responses     │
                    └──────┬───────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐     ┌──────────────┐
                    │ Website JS   │────▶│ Browse &     │
                    │ (fetches CSV)│     │ Download      │
                    └──────────────┘     └──────────────┘
```

1. **Upload**: Student fills the embedded Google Form → file goes to ONE Google Drive folder
2. **Storage**: Form responses (including Drive file links) are auto-saved to a linked Google Sheet  
3. **Display**: The website fetches the published Google Sheet data (no API key!) and renders note cards
4. **Download**: Each note card links directly to the Google Drive file for preview/download

---

## 🗂️ File Structure

```
notes-hub/
├── index.html    → Main HTML page
├── style.css     → All styling (dark glassmorphism theme)
├── script.js     → Logic, config, fetching, rendering
└── README.md     → This setup guide
```

---

## ⚠️ Important Notes

- **All files uploaded through the form go to a single Google Drive folder** — this is Google Forms' default behavior for file upload fields
- The Google Drive folder MUST be set to "Anyone with the link can view" for downloads to work
- The Google Sheet MUST be published to web for the website to read it
- No API keys, no backend, no server — everything runs client-side
- The website shows **demo notes** when no Sheet ID is configured (great for previewing the design)

---

## 🎨 Features

- ✅ Dark mode glassmorphism design
- ✅ Responsive (mobile, tablet, desktop)
- ✅ Real-time search & filter by subject
- ✅ Direct download links from Google Drive
- ✅ Preview notes in Google Drive viewer
- ✅ Animated stats counter
- ✅ Smooth scroll animations
- ✅ Zero dependencies — pure HTML/CSS/JS
- ✅ No API keys needed
- ✅ Single Google Drive folder for all uploads

---

## 📄 License

Free to use. Built with ❤️ for students.
