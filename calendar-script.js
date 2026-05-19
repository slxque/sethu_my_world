/**
 * CALENDAR NAVIGATION SCRIPT
 * Specifically for the Digital Diary Project
 */

// 1. SUPABASE CONFIG
const supabaseUrl = 'https://hkgiedepklnazpllwswh.supabase.co';
const supabaseKey = 'sb_publishable_LslgXtX5dpZfJ09zpst1gw_KnjGcOfB';
const supabaseClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let datesWithEntries = new Set();

// 2. FETCH ACTIVE DATES FROM DATABASE
async function getActiveDates() {
    if (!supabaseClient) {
        renderCalendar();
        return;
    }
    try {
        const { data, error } = await supabaseClient
            .from('mood_logs')
            .select('created_at');

        if (error) throw error;

        datesWithEntries.clear();
        if (data && Array.isArray(data)) {
            data.forEach(row => {
                if (row.created_at) {
                    const dateStr = row.created_at.split('T')[0];
                    datesWithEntries.add(dateStr);
                }
            });
        }

        renderCalendar();
    } catch (err) {
        console.error("Error fetching dates:", err.message);
        renderCalendar();
    }
}

// 3. RENDER THE CALENDAR STRUCTURE
function renderCalendar() {
    const daysContainer = document.getElementById('calendar-days');
    const monthDisplay = document.getElementById('month-year-display');

    if (!daysContainer || !monthDisplay) return;
    daysContainer.innerHTML = '';

    // Set Header Display Text
    const date = new Date(currentYear, currentMonth);
    const monthName = date.toLocaleString('default', { month: 'long' });
    monthDisplay.innerText = `${monthName} ${currentYear}`;

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Get today's real-world system date (YYYY-MM-DD)
    const todayObj = new Date();
    const todayStr = `${todayObj.getFullYear()}-${(todayObj.getMonth() + 1).toString().padStart(2, '0')}-${todayObj.getDate().toString().padStart(2, '0')}`;

    // Create empty slots for days before the 1st of the month
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'day empty';
        daysContainer.appendChild(emptyDiv);
    }

    // Create the actual day items
    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.innerText = i;

        const formatMonth = (currentMonth + 1).toString().padStart(2, '0');
        const formatDay = i.toString().padStart(2, '0');
        const fullDateStr = `${currentYear}-${formatMonth}-${formatDay}`;

        // 💜 RULE 1: If it's today's date, assign purple class highlight
        if (fullDateStr === todayStr) {
            dayDiv.classList.add('is-today');
            dayDiv.onclick = () => {
                window.location.href = `diary.html?date=${fullDateStr}`;
            };
        }
        // 💗 RULE 2: If it has past entry records, assign pink class highlight
        else if (datesWithEntries.has(fullDateStr)) {
            dayDiv.classList.add('has-entry');
            dayDiv.onclick = () => {
                window.location.href = `diary.html?date=${fullDateStr}`;
            };
        }

        daysContainer.appendChild(dayDiv);
    }
}

// 4. NAVIGATION CONTROLS
window.changeMonth = (direction) => {
    currentMonth += direction;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
};

// Start initialization on window load
document.addEventListener('DOMContentLoaded', getActiveDates);
