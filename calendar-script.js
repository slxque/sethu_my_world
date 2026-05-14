/**
 * CALENDAR NAVIGATION SCRIPT
 * Specifically for the Digital Diary Project
 */

// 1. SUPABASE CONFIG (Match your script.js)
const supabaseUrl = 'https://hkgiedepklnazpllwswh.supabase.co';
const supabaseKey = 'sb_publishable_LslgXtX5dpZfJ09zpst1gw_KnjGcOfB';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let datesWithEntries = new Set();

// 2. FETCH ACTIVE DATES
async function getActiveDates() {
    try {
        // We only need the 'created_at' column to highlight the calendar
        const { data, error } = await supabaseClient
            .from('mood_logs')
            .select('created_at');

        if (error) throw error;

        // Convert timestamps to YYYY-MM-DD format and store in a Set for fast lookup
        data.forEach(row => {
            const dateStr = row.created_at.split('T')[0];
            datesWithEntries.add(dateStr);
        });

        renderCalendar();
    } catch (err) {
        console.error("Error fetching dates:", err.message);
        renderCalendar(); // Render anyway even if fetch fails
    }
}

// 3. RENDER THE CALENDAR
function renderCalendar() {
    const daysContainer = document.getElementById('calendar-days');
    const monthDisplay = document.getElementById('month-year-display');

    if (!daysContainer) return;
    daysContainer.innerHTML = '';

    // Set Header Display
    const date = new Date(currentYear, currentMonth);
    const monthName = date.toLocaleString('default', { month: 'long' });
    monthDisplay.innerText = `${monthName} ${currentYear}`;

    // Get first day of month (0 = Sun, 1 = Mon...)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // Get total days in month
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Create empty slots for days before the 1st of the month
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'day empty';
        daysContainer.appendChild(emptyDiv);
    }

    // Create the actual days
    for (let i = 1; i <= lastDay; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'day';
        dayDiv.innerText = i;

        // Format this specific day to YYYY-MM-DD for comparison
        const formatMonth = (currentMonth + 1).toString().padStart(2, '0');
        const formatDay = i.toString().padStart(2, '0');
        const fullDateStr = `${currentYear}-${formatMonth}-${formatDay}`;

        // Check if this date has an entry in our Set
        if (datesWithEntries.has(fullDateStr)) {
            dayDiv.classList.add('has-entry');
            dayDiv.onclick = () => {
                // Navigate back to diary and pass the date via URL parameter
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

// Initialize
document.addEventListener('DOMContentLoaded', getActiveDates);