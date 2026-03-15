/**
 * ============================================================
 *  NotesDrop — Configuration & Logic
 * ============================================================
 *
 *  HOW TO SET UP:
 *
 *  1. Create a Google Form with these fields:
 *     - Your Name (Short answer)
 *     - Subject (Dropdown or Short answer)
 *     - Title / Topic (Short answer)
 *     - Description (Paragraph, optional)
 *     - File Upload (File upload — all files go to ONE Google Drive folder)
 *
 *  2. Link the form to a Google Sheet (Responses → "View in Sheets")
 *
 *  3. In that Google Sheet, publish it to the web:
 *     File → Share → Publish to web → Entire Document → CSV → Publish
 *
 *  4. Copy your Google Sheet ID from the URL:
 *     https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
 *
 *  5. Replace SHEET_ID and FORM_URL below with your actual values
 *
 *  6. Get the Form URL: Open your form → Click "Publish" (top-right)
 *     → Copy the "Responders link"
 *     (NOTE: Forms with file uploads CANNOT be embedded in iframes,
 *      so we open them in a new tab instead)
 *
 *  7. Ensure your Google Drive folder (where uploads go) is set to
 *     "Anyone with the link can view" so download links work.
 *
 * ============================================================
 */

// ============================================================
//  🔧 CONFIGURATION — UPDATE THESE VALUES
// ============================================================

const CONFIG = {
    // Your Google Sheet ID (from the published sheet URL)
    SHEET_ID: '1xfhVkFizjZ8-sujpKT1H9wztVA5_DUkNryOjadwR2e4',

    // Your Google Form URL (opens in a new tab for file upload)
    // Get it from: Form → Publish → Copy "Responders link"
    FORM_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSeAijeFcltZ7jAuUgQL60LqyFeL6Bkd8fwy313ZOVqVenfu4A/viewform',

    // Column mapping — adjust these to match YOUR Google Sheet column order
    // (0-indexed: Column A = 0, Column B = 1, etc.)
    COLUMNS: {
        TIMESTAMP: 0,   // Column A — Timestamp (auto-generated)
        NAME: 1,         // Column B — Uploader Name
        SUBJECT: 2,      // Column C — Subject
        TITLE: 3,        // Column D — Title / Topic
        DESCRIPTION: 4,  // Column E — Description
        FILE_URL: 5      // Column F — File Upload (Drive link)
    }
};

// ============================================================
//  APP STATE
// ============================================================
let allNotes = [];
let activeFilter = 'all';
let searchQuery = '';

// ============================================================
//  INITIALIZATION
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initSearchAndFilter();
    initScrollAnimations();
    setupForm();
    fetchNotes();
});

// ============================================================
//  NAVBAR
// ============================================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        updateActiveNavLink();
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

function updateActiveNavLink() {
    const sections = ['home', 'browse', 'upload', 'how-it-works'];
    const navLinks = document.querySelectorAll('.nav-link');
    let current = '';

    sections.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
                current = id;
            }
        }
    });

    if (current) {
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    }
}

// ============================================================
//  MOBILE MENU
// ============================================================
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const menu = document.getElementById('mobileMenu');
    const links = menu.querySelectorAll('.mobile-link');

    toggle.addEventListener('click', () => {
        menu.classList.toggle('open');
        toggle.classList.toggle('active');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('open');
            toggle.classList.remove('active');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('open');
            toggle.classList.remove('active');
        }
    });
}

// ============================================================
//  SEARCH & FILTER
// ============================================================
function initSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const searchClear = document.getElementById('searchClear');

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        searchClear.classList.toggle('visible', searchQuery.length > 0);
        renderNotes();
    });

    searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        searchClear.classList.remove('visible');
        renderNotes();
    });
}

function handleFilterClick(e) {
    const chip = e.target;
    if (!chip.classList.contains('filter-chip')) return;

    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    renderNotes();
}

// ============================================================
//  GOOGLE FORM SETUP (opens in new tab — can't embed file upload forms)
// ============================================================
function setupForm() {
    const directLink = document.getElementById('formDirectLink');

    if (CONFIG.FORM_URL) {
        directLink.href = CONFIG.FORM_URL;
    } else {
        directLink.href = '#';
        directLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Form URL not configured yet! Update FORM_URL in script.js with your Google Form link.');
        });
    }
}

// ============================================================
//  FETCH NOTES FROM PUBLISHED GOOGLE SHEET (JSONP — works locally!)
// ============================================================
function fetchNotes() {
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const setupNotice = document.getElementById('setupNotice');
    const notesGrid = document.getElementById('notesGrid');

    if (!CONFIG.SHEET_ID) {
        loadingState.classList.add('hidden');
        setupNotice.classList.remove('hidden');
        updateStats(0, 0);
        loadDemoNotes();
        return;
    }

    // Use JSONP approach (script tag injection) to bypass CORS
    // This works even when opening index.html as a local file!
    const callbackName = 'handleSheetData';

    // Define the global callback that Google will invoke
    window[callbackName] = function(data) {
        try {
            const rows = data.table.rows;

            allNotes = rows.map((row, index) => {
                const cells = row.c;
                const col = CONFIG.COLUMNS;

                let fileUrl = getCellValue(cells, col.FILE_URL);
                const fileId = extractDriveFileId(fileUrl);

                return {
                    id: index,
                    timestamp: getCellValue(cells, col.TIMESTAMP),
                    name: getCellValue(cells, col.NAME) || 'Anonymous',
                    subject: getCellValue(cells, col.SUBJECT) || 'General',
                    title: getCellValue(cells, col.TITLE) || 'Untitled Notes',
                    description: getCellValue(cells, col.DESCRIPTION) || '',
                    fileUrl: fileUrl,
                    fileId: fileId,
                    downloadUrl: fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : fileUrl,
                    previewUrl: fileId ? `https://drive.google.com/file/d/${fileId}/view` : fileUrl,
                    fileType: guessFileType(fileUrl)
                };
            }).filter(note => note.title && note.fileUrl);

            allNotes.reverse();
            loadingState.classList.add('hidden');

            if (allNotes.length === 0) {
                emptyState.classList.remove('hidden');
                updateStats(0, 0);
            } else {
                buildFilterChips();
                renderNotes();
                updateStats(allNotes.length, getUniqueSubjects().length);
            }
        } catch (error) {
            console.error('Error processing sheet data:', error);
            loadingState.classList.add('hidden');
            setupNotice.classList.remove('hidden');
            setupNotice.querySelector('p').textContent = `Error processing notes: ${error.message}`;
            loadDemoNotes();
        }

        // Cleanup
        delete window[callbackName];
        if (scriptEl && scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
    };

    // Create a script tag to load the data (bypasses CORS)
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:${callbackName}`;
    const scriptEl = document.createElement('script');
    scriptEl.src = url;

    scriptEl.onerror = function() {
        console.error('Failed to load sheet data');
        loadingState.classList.add('hidden');
        setupNotice.classList.remove('hidden');
        setupNotice.querySelector('p').textContent = 'Failed to load notes. Check that your Sheet ID is correct and the sheet is published to web.';
        loadDemoNotes();
        delete window[callbackName];
        if (scriptEl.parentNode) scriptEl.parentNode.removeChild(scriptEl);
    };

    document.head.appendChild(scriptEl);
}

// ============================================================
//  HELPERS
// ============================================================

function getCellValue(cells, index) {
    if (!cells || !cells[index]) return '';
    // Google Sheets returns formatted value (f) and raw value (v)
    return cells[index].f || (cells[index].v !== null ? String(cells[index].v) : '');
}

function extractDriveFileId(url) {
    if (!url) return null;
    // Match various Google Drive URL formats
    const patterns = [
        /\/d\/([a-zA-Z0-9_-]+)/,           // /d/FILE_ID/
        /id=([a-zA-Z0-9_-]+)/,             // ?id=FILE_ID
        /open\?id=([a-zA-Z0-9_-]+)/,       // open?id=FILE_ID
        /uc\?.*id=([a-zA-Z0-9_-]+)/        // uc?id=FILE_ID
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function guessFileType(url) {
    if (!url) return 'FILE';
    const lower = url.toLowerCase();
    if (lower.includes('.pdf') || lower.includes('pdf')) return 'PDF';
    if (lower.includes('.doc') || lower.includes('doc')) return 'DOC';
    if (lower.includes('.ppt') || lower.includes('ppt')) return 'PPT';
    if (lower.includes('.xls') || lower.includes('xls')) return 'XLS';
    if (lower.includes('.jpg') || lower.includes('.jpeg') || lower.includes('.png')) return 'IMG';
    if (lower.includes('.txt')) return 'TXT';
    return 'FILE';
}

function getUniqueSubjects() {
    return [...new Set(allNotes.map(n => n.subject))];
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    try {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return timestamp;
    }
}

// ============================================================
//  FILTER CHIPS
// ============================================================
function buildFilterChips() {
    const filterBar = document.querySelector('.filter-bar');
    const subjects = getUniqueSubjects();

    filterBar.innerHTML = '<button class="filter-chip active" data-filter="all">All</button>';
    subjects.forEach(subject => {
        const chip = document.createElement('button');
        chip.className = 'filter-chip';
        chip.dataset.filter = subject;
        chip.textContent = subject;
        filterBar.appendChild(chip);
    });

    filterBar.addEventListener('click', handleFilterClick);
}

// ============================================================
//  RENDER NOTES
// ============================================================
function renderNotes() {
    const grid = document.getElementById('notesGrid');
    const emptyState = document.getElementById('emptyState');

    let filtered = allNotes;

    // Filter by subject
    if (activeFilter !== 'all') {
        filtered = filtered.filter(n =>
            n.subject.toLowerCase() === activeFilter.toLowerCase()
        );
    }

    // Filter by search
    if (searchQuery) {
        filtered = filtered.filter(n =>
            n.title.toLowerCase().includes(searchQuery) ||
            n.subject.toLowerCase().includes(searchQuery) ||
            n.name.toLowerCase().includes(searchQuery) ||
            n.description.toLowerCase().includes(searchQuery)
        );
    }

    if (filtered.length === 0) {
        grid.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    grid.innerHTML = filtered.map(note => `
        <div class="note-card" data-subject="${note.subject}">
            <div class="note-card-content">
                <div class="note-card-header">
                    <span class="note-subject-badge">${escapeHtml(note.subject)}</span>
                    <span class="note-file-type">${note.fileType}</span>
                </div>
                <h3 class="note-title">${escapeHtml(note.title)}</h3>
                ${note.description ? `<p class="note-description">${escapeHtml(note.description)}</p>` : ''}
                <div class="note-meta">
                    <span class="note-meta-item">👤 ${escapeHtml(note.name)}</span>
                    ${note.timestamp ? `<span class="note-meta-item">📅 ${formatDate(note.timestamp)}</span>` : ''}
                </div>
                <div class="note-actions">
                    <a href="${note.downloadUrl}" class="note-btn note-btn-download" target="_blank" rel="noopener" title="Download">
                        ⬇ Download
                    </a>
                    <a href="${note.previewUrl}" class="note-btn note-btn-preview" target="_blank" rel="noopener" title="Preview in Drive">
                        👁 Preview
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================
//  STATS
// ============================================================
function updateStats(total, subjects) {
    const totalEl = document.getElementById('totalNotes');
    const subjectsEl = document.getElementById('totalSubjects');

    animateNumber(totalEl, total);
    animateNumber(subjectsEl, subjects);
}

function animateNumber(el, target) {
    const duration = 1000;
    const start = performance.now();
    const initial = 0;

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(initial + (target - initial) * eased);
        el.textContent = current;
        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

// ============================================================
//  DEMO NOTES (shown when sheet is not configured)
// ============================================================
function loadDemoNotes() {
    allNotes = [
        {
            id: 0,
            timestamp: '2026-03-15',
            name: 'Rahul S.',
            subject: 'Data Structures',
            title: 'Binary Trees — Complete Notes',
            description: 'Covers BST, AVL, Red-Black trees with diagrams and code examples.',
            fileUrl: '#',
            fileId: null,
            downloadUrl: '#',
            previewUrl: '#',
            fileType: 'PDF'
        },
        {
            id: 1,
            timestamp: '2026-03-14',
            name: 'Priya M.',
            subject: 'Mathematics II',
            title: 'Laplace Transforms — Cheat Sheet',
            description: 'Formula sheet with solved examples for all transform types.',
            fileUrl: '#',
            fileId: null,
            downloadUrl: '#',
            previewUrl: '#',
            fileType: 'PDF'
        },
        {
            id: 2,
            timestamp: '2026-03-13',
            name: 'Amit K.',
            subject: 'Physics',
            title: 'Electromagnetic Waves — Unit 4',
            description: 'Handwritten notes covering Maxwell equations and wave propagation.',
            fileUrl: '#',
            fileId: null,
            downloadUrl: '#',
            previewUrl: '#',
            fileType: 'IMG'
        },
        {
            id: 3,
            timestamp: '2026-03-12',
            name: 'Sneha R.',
            subject: 'Chemistry',
            title: 'Organic Chemistry — Reaction Mechanisms',
            description: 'SN1, SN2, E1, E2 mechanisms with practice problems.',
            fileUrl: '#',
            fileId: null,
            downloadUrl: '#',
            previewUrl: '#',
            fileType: 'DOCX'
        },
        {
            id: 4,
            timestamp: '2026-03-11',
            name: 'Karan P.',
            subject: 'Data Structures',
            title: 'Graph Algorithms — DFS, BFS, Dijkstra',
            description: 'Step-by-step walkthroughs with complexity analysis.',
            fileUrl: '#',
            fileId: null,
            downloadUrl: '#',
            previewUrl: '#',
            fileType: 'PPT'
        },
        {
            id: 5,
            timestamp: '2026-03-10',
            name: 'Anonymous',
            subject: 'Mathematics II',
            title: 'Fourier Series — Full Notes + PYQs',
            description: 'Complete notes with previous year solved questions.',
            fileUrl: '#',
            fileId: null,
            downloadUrl: '#',
            previewUrl: '#',
            fileType: 'PDF'
        }
    ];

    document.getElementById('loadingState').classList.add('hidden');
    buildFilterChips();
    renderNotes();
    updateStats(allNotes.length, getUniqueSubjects().length);
}

// ============================================================
//  SCROLL ANIMATIONS
// ============================================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements that should animate on scroll
    document.querySelectorAll('.step-card, .info-card, .section-header').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}
