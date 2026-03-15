# 📝 NotesDrop — Notes Upload & Download Website

A beautiful, free notes sharing website where students can upload study notes via **Google Forms** (files go to **one shared Google Drive folder**) and anyone can browse & download them. **No API keys needed!**


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
