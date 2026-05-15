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
        loadSavedEntries();
        renderNotePile();
    } catch (err) {
        console.warn("Sync failed:", err.message);
    }
}

// --- STICKY NOTE LOGIC ---
function renderNotePile() {
    const container = document.getElementById('sticky-pile-container');
    if (!container) return;
    if (allNotes.length === 0) { container.style.display = 'none'; return; }

    container.style.display = 'block';
    container.innerHTML = '';
    const layers = Math.min(allNotes.length, 3);
    for (let i = 0; i < layers; i++) {
        const noteEl = document.createElement('div');
        noteEl.className = 'stacked-note';
        const rotation = (i * 3) - 3;
        noteEl.style.transform = `rotate(${rotation}deg) translate(${i * 2}px, ${i * 2}px)`;
        noteEl.style.zIndex = 10 - i;
        if (i === 0) { noteEl.innerHTML = `<p>${allNotes[0].text}</p>`; }
        container.appendChild(noteEl);
    }
}

window.openNoteModal = () => { document.getElementById('note-modal').style.display = 'flex'; };
window.closeNoteModal = () => { document.getElementById('note-modal').style.display = 'none'; };

window.saveStickyNote = async () => {
    const textInput = document.getElementById('note-text');
    if (!textInput || !textInput.value.trim()) return;
    try {
        await supabaseClient.from(TABLE_NAME).insert([{ mood_type: 'note', caption: textInput.value, image_url: null }]);
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
            await supabaseClient.from(TABLE_NAME).insert([{
                mood_type: file.type.startsWith('video') ? 'video' : 'image',
                caption: userCaption,
                image_url: publicUrl
            }]);
            syncFromSupabase();
        } catch (err) { console.error("Upload failed"); }
    }
};

function loadSavedEntries() {
    const container = document.getElementById('diary-container');
    if (!container) return;
    container.innerHTML = '';
    const keys = Object.keys(dailyUploads).sort().reverse();
    if (keys.length === 0) {
        container.innerHTML = '<div class="placeholder">Make a diary entry</div>';
        return;
    }
    keys.forEach(date => {
        const items = dailyUploads[date].filter(i => i.url && i.url !== "null");
        if (items.length === 0) return;
        const entry = document.createElement('div');
        entry.className = 'diary-entry';
        entry.innerHTML = `<div class="entry-header"><div class="date-main">${date}</div><div class="dear-diary">Dear diary,</div></div><div class="entry-content-wrapper"></div>`;
        const wrapper = entry.querySelector('.entry-content-wrapper');
        const pile = document.createElement('div');
        pile.className = 'polaroid-pile';
        pile.onclick = () => openGrid(date);
        items.slice(0, 3).forEach((item, idx) => {
            const photo = document.createElement('div');
            photo.className = 'stacked-polaroid';
            photo.style.transform = `rotate(${(idx % 2 === 0 ? 1 : -1) * (idx * 4)}deg)`;
            photo.innerHTML = `<div class="picture-frame">${item.type === 'video' ? `<video src="${item.url}" muted loop autoplay></video>` : `<img src="${item.url}">`}</div>`;
            pile.appendChild(photo);
        });
        wrapper.appendChild(pile);
        container.appendChild(entry);
    });
}

function openGrid(date) {
    const content = document.querySelector('#gallery-modal .modal-content');
    content.innerHTML = '';
    dailyUploads[date].filter(i => i.url).forEach(item => {
        const div = document.createElement('div');
        div.className = 'gallery-item';
        div.innerHTML = item.type === 'video' ? `<video src="${item.url}"></video>` : `<img src="${item.url}">`;
        div.onclick = () => {
            document.getElementById('viewer-media').innerHTML = `<div class="media-wrapper">${item.type === 'video' ? `<video src="${item.url}" controls autoplay></video>` : `<img src="${item.url}">`}<div class="caption-strip">${item.caption || ''}</div></div>`;
            document.getElementById('full-screen-viewer').style.display = 'flex';
        };
        content.appendChild(div);
    });
    document.getElementById('gallery-modal').style.display = 'flex';
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const resp = await fetch('sticky.html');
        const html = await resp.text();
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
    } catch (e) {}
    syncFromSupabase();
});

// --- CLOSE HELPERS ---
window.closeGrid = () => document.getElementById('gallery-modal').style.display = 'none';

window.closeFullScreen = () => {
    const viewer = document.getElementById('full-screen-viewer');
    const container = document.getElementById('viewer-media');
    if (viewer) viewer.style.display = 'none';
    // KILL SOUND: Clear the innerHTML to remove the video element from DOM
    if (container) container.innerHTML = '';
};

window.closeNoteGrid = () => document.getElementById('note-grid-modal').style.display = 'none';
window.closeNoteViewer = () => document.getElementById('note-viewer-overlay').style.display = 'none';