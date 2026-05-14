/**
 * FOR MY WORLD - Siphosethu's Project
 * Final Integrated Script - Version 7.0 (Sticky Note & Nav Visibility Fix)
 */

// --- 1. GLOBAL CONFIG & STATE ---
const TABLE_NAME = 'mood_logs';
const BUCKET_NAME = 'diary-images';
const supabaseUrl = 'https://hkgiedepklnazpllwswh.supabase.co';
const supabaseKey = 'sb_publishable_LslgXtX5dpZfJ09zpst1gw_KnjGcOfB';

let dailyUploads = {};
let allNotes = []; 
let viewOffset = 0; 
const supabaseClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

// --- 2. DATABASE SYNC ---
async function syncFromSupabase() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const freshData = {};
        allNotes = [];

        if (data && data.length > 0) {
            data.forEach(row => {
                const d = new Date(row.created_at);
                const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                
                if (!freshData[dateKey]) freshData[dateKey] = [];
                
                freshData[dateKey].push({ 
                    type: row.mood_type, 
                    caption: row.caption, 
                    url: row.image_url 
                });
                
                if (row.mood_type === 'note') { 
                    allNotes.push({ text: row.caption, date: dateKey }); 
                }
            });
        }
        dailyUploads = freshData;

        // URL logic for calendar selection
        const urlParams = new URLSearchParams(window.location.search);
        const sharedDate = urlParams.get('date');
        if (sharedDate) {
            const targetDate = new Date(sharedDate);
            const today = new Date();
            today.setHours(0,0,0,0); targetDate.setHours(0,0,0,0);
            viewOffset = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
        }

        updateView();
    } catch (err) { console.warn("Sync failed:", err.message); }
}

// --- 3. VIEW & NAVIGATION LOGIC ---
function updateView() {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + viewOffset);
    const dateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
    
    // Update Nav bar date
    const navDate = document.getElementById('current-nav-date');
    if (navDate) {
        navDate.innerText = viewOffset === 0 ? "Today" : targetDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    }

    // --- NAVIGATION ARROW FIX ---
    // Hide "Next" arrow if we are at Today or in the future
    const nextBtn = document.getElementById('next-day');
    if (nextBtn) {
        if (viewOffset >= 0) {
            nextBtn.style.visibility = "hidden";
        } else {
            nextBtn.style.visibility = "visible";
        }
    }

    renderDayEntries(dateKey);
}

window.changeDay = (direction) => {
    viewOffset += direction;
    updateView();
};

// --- 4. UI RENDERING ---
function renderDayEntries(dateKey) {
    const container = document.getElementById('diary-container');
    if (!container) return;
    container.innerHTML = '';

    const dayItems = dailyUploads[dateKey] || [];
    const visibleItems = dayItems.filter(i => 
        (i.caption && i.caption !== "NULL" && i.caption !== "null") || 
        (i.url && i.url !== "NULL" && i.url !== "null")
    );

    if (visibleItems.length === 0) {
        container.innerHTML = `
            <div style="color: #ffb6c1; font-style: italic; text-align: center; padding-top: 50px; width: 100%;">
                No memories logged for ${dateKey.replace(/-/g, '/')} yet...
            </div>`;
        return;
    }

    const entry = document.createElement('div');
    entry.className = 'diary-entry';
    
    let contentHtml = `
        <div class="entry-header">
            <div class="date-main">${dateKey.replace(/-/g, '/')}</div>
            <div class="dear-diary">Dear diary,</div>
        </div>
        <div class="media-stack">`;

    visibleItems.forEach(item => {
        if (item.type === 'image' || item.type === 'video') {
            // Render the centered photo frame
            contentHtml += `
                <div class="centered-polaroid">
                    <div class="picture-frame">
                        ${item.type === 'video' 
                            ? `<video src="${item.url}" muted loop autoplay playsinline style="width: 100%;"></video>` 
                            : `<img src="${item.url}" style="width: 100%;">`}
                    </div>
                    <div class="polaroid-footer">
                        ${(item.caption && item.caption !== "null") ? item.caption : ''}
                    </div>
                </div>`;
        } else if (item.type === 'note') {
            // --- STICKY NOTE FIX ---
            // Wraps text notes in the sticky-note class from your sticky.css
            contentHtml += `
                <div class="sticky-note">
                    <p>${item.caption}</p>
                </div>`;
        }
    });

    contentHtml += `</div>`;
    entry.innerHTML = contentHtml;
    container.appendChild(entry);
}

// --- 5. ACTIONS & UPLOADS ---
window.saveStickyNote = async () => {
    const textInput = document.getElementById('note-text');
    if (!textInput || !textInput.value.trim()) return;
    
    const text = textInput.value;
    try {
        const { error } = await supabaseClient
            .from(TABLE_NAME)
            .insert([{ mood_type: 'note', caption: text }]);

        if (error) throw error;

        window.closeNoteModal();
        textInput.value = '';
        syncFromSupabase(); // Refresh the view immediately
    } catch (err) { 
        console.error("Save failed:", err.message); 
        alert("Couldn't save note. Please check your connection.");
    }
};

async function handleUpload(event) {
    const files = event.target.files;
    if (!files || !files.length || !supabaseClient) return;

    for (let file of files) {
        const userCaption = prompt(`Caption for "${file.name}":`, "A special moment");
        if (userCaption === null) continue;

        const filePath = `uploads/${Date.now()}-${file.name}`;
        try {
            // 1. Upload to Storage
            const { error: uploadError } = await supabaseClient.storage
                .from(BUCKET_NAME)
                .upload(filePath, file);
            
            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabaseClient.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            // 3. Insert into Database
            await supabaseClient.from(TABLE_NAME).insert([{
                mood_type: file.type.startsWith('video') ? 'video' : 'image',
                caption: userCaption,
                image_url: publicUrl
            }]);

            syncFromSupabase();
        } catch (err) { 
            console.error("Upload failed:", err.message); 
        }
    }
}

// --- 6. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    syncFromSupabase();
});

// Global UI Triggers
window.handleUpload = handleUpload; 
window.openNoteModal = () => { 
    document.getElementById('note-modal').style.display = 'flex'; 
};
window.closeNoteModal = () => { 
    document.getElementById('note-modal').style.display = 'none'; 
};
window.triggerUpload = (e) => { 
    if (e) e.stopPropagation(); 
    document.getElementById('file-input').click(); 
};
