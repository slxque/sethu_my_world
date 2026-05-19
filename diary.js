/**
 * FOR MY WORLD - Diary Page Script
 * Specifically for diary.html
 */

const TABLE_NAME = 'mood_logs';
const BUCKET_NAME = 'diary-images';
const supabaseUrl = 'https://hkgiedepklnazpllwswh.supabase.co';
const supabaseKey = 'sb_publishable_LslgXtX5dpZfJ09zpst1gw_KnjGcOfB';

let dailyUploads = {};
let allNotes = [];
const supabaseClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

// --- DATE NAVIGATION VARIABLES ---
// Tracks the active date being viewed on screen
let currentDateSelected = new Date().toISOString().split('T')[0];

// --- DATABASE SYNC ---
async function syncFromSupabase() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient.from(TABLE_NAME).select('*').order('created_at', { ascending: false });
        if (error) throw error;

        const freshData = {};
        allNotes = [];

        if (data && data.length > 0) {
            data.forEach(row => {
                const date = row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0];
                if (!freshData[date]) freshData[date] = [];
                freshData[date].push({ type: row.mood_type, caption: row.caption, url: row.image_url });
                if (row.mood_type === 'note') {
                    allNotes.push({ text: row.caption, date: date });
                }
            });
        }
        dailyUploads = freshData;

        // If the current landing date has no entries, we display the fresh empty page locally.
        // It remains unsaved in Supabase until a user explicitly inserts data.
        loadSavedEntries();
    } catch (err) {
        console.warn("Sync failed:", err.message);
    }
}

// --- STICKY NOTE LOGIC ---
function renderNotePile() {
    const container = document.getElementById('sticky-pile-container');
    if (!container) return;

    // Filter sticky notes to only show those belonging to the selected date
    const notesForThisDay = allNotes.filter(note => note.date === currentDateSelected);

    if (notesForThisDay.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = '';
    const layers = Math.min(notesForThisDay.length, 3);
    for (let i = 0; i < layers; i++) {
        const noteEl = document.createElement('div');
        noteEl.className = 'stacked-note';
        const rotation = (i * 3) - 3;
        noteEl.style.transform = `rotate(${rotation}deg) translate(${i * 2}px, ${i * 2}px)`;
        noteEl.style.zIndex = 10 - i;
        if (i === 0) { noteEl.innerHTML = `<p>${notesForThisDay[0].text}</p>`; }
        container.appendChild(noteEl);
    }
}

window.openNoteModal = () => { document.getElementById('note-modal').style.display = 'flex'; };
window.closeNoteModal = () => { document.getElementById('note-modal').style.display = 'none'; };

window.saveStickyNote = async () => {
    const textInput = document.getElementById('note-text');
    if (!textInput || !textInput.value.trim()) return;
    try {
        await supabaseClient.from(TABLE_NAME).insert([{
            mood_type: 'note',
            caption: textInput.value,
            image_url: null,
            created_at: new Date(currentDateSelected).toISOString()
        }]);
        closeNoteModal();
        textInput.value = '';
        syncFromSupabase();
    } catch (err) { console.error("Save failed:", err.message); }
};

window.openNoteGrid = () => {
    const grid = document.getElementById('sticky-grid');
    grid.innerHTML = '';

    allNotes.forEach((note) => {
        const item = document.createElement('div');
        item.className = 'grid-note-item';
        item.innerHTML = `<p>${note.text}</p>`;
        item.onclick = () => {
            document.getElementById('full-note-content').innerText = note.text;
            document.getElementById('note-viewer-overlay').style.display = 'flex';
        };
        grid.appendChild(item);
    });
    document.getElementById('note-grid-modal').style.display = 'flex';
};

// --- UPLOAD & GALLERY ---
window.triggerUpload = (e) => { e.stopPropagation(); document.getElementById('file-input').click(); };

window.handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || !files.length) return;
    for (let file of files) {
        const userCaption = prompt(`Caption for "${file.name}":`);
        if (userCaption === null) continue;
        const filePath = `uploads/${Date.now()}-${file.name}`;
        try {
            await supabaseClient.storage.from(BUCKET_NAME).upload(filePath, file);
            const { data: { publicUrl } } = supabaseClient.storage.from(BUCKET_NAME).getPublicUrl(filePath);

            // This is the point where the entry actually gets saved to your database
            await supabaseClient.from(TABLE_NAME).insert([{
                mood_type: file.type.startsWith('video') ? 'video' : 'image',
                caption: userCaption,
                image_url: publicUrl,
                created_at: new Date(currentDateSelected).toISOString()
            }]);
            syncFromSupabase();
        } catch (err) { console.error("Upload failed"); }
    }
};

// --- SINGLE DAY RENDERING VIEW ---
function loadSavedEntries() {
    const container = document.getElementById('diary-container');
    const dateDisplay = document.getElementById('current-view-date');
    const nextArrow = document.getElementById('next-day');

    if (!container) return;
    container.innerHTML = '';

    // 1. Setup the display date formatting strings
    const todayStr = new Date().toISOString().split('T')[0];
    if (currentDateSelected === todayStr) {
        if (dateDisplay) dateDisplay.innerText = "Today";
    } else {
        if (dateDisplay) dateDisplay.innerText = currentDateSelected;
    }

    // Determine navigation arrow visibilities based on available saved database content
    const activeDates = Object.keys(dailyUploads).filter(d => {
        return dailyUploads[d].some(i => i.url && i.url !== "null") || allNotes.some(n => n.date === d);
    });
    const hasNewerDates = activeDates.some(d => d > currentDateSelected);
    if (nextArrow) {
        nextArrow.style.visibility = (hasNewerDates || currentDateSelected < todayStr) ? "visible" : "hidden";
    }

    // 2. Isolate media elements linked to this day's database array
    const items = dailyUploads[currentDateSelected] ? dailyUploads[currentDateSelected].filter(i => i.url && i.url !== "null") : [];
    const hasNotes = allNotes.some(n => n.date === currentDateSelected);

    // 3. IF THE DAY IS EMPTY: Show the clean blank notebook text layer
    // It remains locally generated on your browser runtime and is not saved to your backend table.
    if (items.length === 0 && !hasNotes) {
        container.innerHTML = '<div id="placeholder-text" class="placeholder">Make a diary entry</div>';
        renderNotePile();
        return;
    }

    // 4. IF DATA EXISTS: Display the entry design layout
    const entry = document.createElement('div');
    entry.className = 'diary-entry';
    entry.innerHTML = `
        <div class="entry-header">
            <div class="date-main">${currentDateSelected}</div>
            <div class="dear-diary">Dear diary,</div>
        </div>
        <div class="entry-content-wrapper"></div>
    `;

    const wrapper = entry.querySelector('.entry-content-wrapper');

    if (items.length > 0) {
        const pile = document.createElement('div');
        pile.className = 'polaroid-pile';
        pile.onclick = () => openGrid(currentDateSelected);

        items.slice(0, 3).forEach((item, idx) => {
            const photo = document.createElement('div');
            photo.className = 'stacked-polaroid';
            photo.style.transform = `rotate(${(idx % 2 === 0 ? 1 : -1) * (idx * 4)}deg)`;
            photo.innerHTML = `<div class="picture-frame">${item.type === 'video' ? `<video src="${item.url}" muted loop></video>` : `<img src="${item.url}">`}</div>`;
            pile.appendChild(photo);
        });
        wrapper.appendChild(pile);
    }

    container.appendChild(entry);
    renderNotePile();
}

function openGrid(date) {
    const content = document.querySelector('#gallery-modal .modal-content');
    content.innerHTML = '';
    dailyUploads[date].filter(i => i.url).forEach(item => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = item.type === 'video' ? `<video src="${item.url}" muted></video>` : `<img src="${item.url}">`;
        div.onclick = () => {
            const cleanCaption = (item.caption && item.caption.trim() !== "" && item.caption !== "null") ? item.caption : "";
            document.getElementById('viewer-media').innerHTML = `
                <div class="media-wrapper">
                    ${item.type === 'video' ? `<video src="${item.url}" controls autoplay></video>` : `<img src="${item.url}">`}
                    <div class="caption-strip">${cleanCaption}</div>
                </div>`;
            document.getElementById('full-screen-viewer').style.display = 'flex';
        };
        content.appendChild(div);
    });
    document.getElementById('gallery-modal').style.display = 'flex';
}

// --- ARROW NAVIGATION LOGIC ---
window.changeDay = (direction) => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Collect all unique saved dates sorted chronologically
    const activeDates = Object.keys(dailyUploads).filter(d => {
        return dailyUploads[d].some(i => i.url && i.url !== "null") || allNotes.some(n => n.date === d);
    }).sort();

    // If the entire diary database is completely blank, navigate standard days manually
    if (activeDates.length === 0) {
        let dateObj = new Date(currentDateSelected);
        dateObj.setDate(dateObj.getDate() + direction);
        const nextDateStr = dateObj.toISOString().split('T')[0];
        if (nextDateStr <= todayStr) {
            currentDateSelected = nextDateStr;
            loadSavedEntries();
        }
        return;
    }

    let targetIndex = activeDates.indexOf(currentDateSelected);

    if (direction === -1) {
        // Going backward
        if (targetIndex > 0) {
            currentDateSelected = activeDates[targetIndex - 1];
        } else if (targetIndex === -1) {
            // If on a temporary empty day view, jump to the closest historical entry
            const pastDates = activeDates.filter(d => d < currentDateSelected);
            if (pastDates.length > 0) currentDateSelected = pastDates[pastDates.length - 1];
        }
    } else if (direction === 1) {
        // Going forward
        if (targetIndex !== -1 && targetIndex < activeDates.length - 1) {
            currentDateSelected = activeDates[targetIndex + 1];
        } else {
            // If we are at the last available entry, let the user move forward into a fresh blank page
            let dateObj = new Date(currentDateSelected);
            dateObj.setDate(dateObj.getDate() + 1);
            const nextDateStr = dateObj.toISOString().split('T')[0];
            if (nextDateStr <= todayStr) currentDateSelected = nextDateStr;
        }
    }

    loadSavedEntries();
};

// --- INIT & QUERY PARSING ---
document.addEventListener('DOMContentLoaded', async () => {
    // Parse calendar parameter selections
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        currentDateSelected = dateParam;
    } else {
        // Default base landing page state on application start is the true calendar current date
        currentDateSelected = new Date().toISOString().split('T')[0];
    }

    try {
        const resp = await fetch('sticky.html');
        const html = await resp.text();
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
    } catch (e) {}

    syncFromSupabase();
});

window.closeGrid = () => document.getElementById('gallery-modal').style.display = 'none';
window.closeFullScreen = () => {
    const viewer = document.getElementById('full-screen-viewer');
    const container = document.getElementById('viewer-media');
    if (viewer) viewer.style.display = 'none';
    if (container) container.innerHTML = '';
};
window.closeNoteGrid = () => document.getElementById('note-grid-modal').style.display = 'none';
window.closeNoteViewer = () => document.getElementById('note-viewer-overlay').style.display = 'none';
