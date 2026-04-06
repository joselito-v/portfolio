// --- work-history.js (Work History Module) ---
import { db } from './firebase-config.js';
import { collection, getDocs, query } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let historyData = [];
let currentStatusFilter = 'All';
let sortDesc = true; 

// Helper function to format text with newline split, bolding before colons, or raw HTML
function formatBulletPoints(text) {
    if (!text) return '<p class="card-text"></p>';
    
    // Check if the user inputted raw HTML tags for paragraphs or lists
    if (/<(?:p|ul|ol|li)[^>]*>/i.test(text)) {
        return `<div class="html-content" style="color: var(--text-light); font-size: 0.95rem; margin-top: 0.5rem;">
                    <style>
                        .html-content p { margin-bottom: 0.8rem; }
                        .html-content ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 0.8rem; }
                        .html-content ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 0.8rem; }
                        .html-content li { margin-bottom: 0; } /* Removed gap between bullets */
                        .html-content ul ul, .html-content ol ol, .html-content ul ol, .html-content ol ul { margin-top: 0; margin-bottom: 0; }
                    </style>
                    ${text}
                </div>`;
    }

    // Helper to bold text before a colon
    const formatLine = (line) => {
        const parts = line.split(':');
        if (parts.length > 1) {
            const boldPart = parts[0];
            const restPart = parts.slice(1).join(':');
            return `<strong>${boldPart.trim()}:</strong> ${restPart.trim()}`;
        }
        return line.trim();
    };

    const array = text.split('\n').filter(line => line.trim() !== "");
    
    if (array.length === 0) return '<p class="card-text"></p>';

    // If it's just a single paragraph/line
    if (array.length === 1) {
        return `<p class="card-text" style="color: var(--text-light); font-size: 0.95rem; margin-top: 0.5rem;">${formatLine(array[0])}</p>`;
    }

    // First paragraph becomes the header, the rest become bullets with no gap between them
    const headerLine = array.shift();
    const headerHtml = `<p class="card-text" style="color: var(--text-light); font-size: 0.95rem; margin-top: 0.5rem; margin-bottom: 0.8rem;">${formatLine(headerLine)}</p>`;
    
    const listItems = array.map(line => `<li style="margin-bottom: 0;">${formatLine(line)}</li>`).join('');
    const listHtml = `<ul style="margin-left: 1.5rem; color: var(--text-light); font-size: 0.95rem;">${listItems}</ul>`;
    
    return `<div>${headerHtml}${listHtml}</div>`;
}

export async function init(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <section>
            <h2 class="section-title">Work History</h2>

            <div style="position: sticky; top: 70px; background-color: var(--bg-light); z-index: 90; padding: 1rem 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div id="status-filters" style="display: flex; gap: 1rem 0.2rem; flex-wrap: wrap;">
                    <button class="filter-btn active" data-status="All">All Status</button>
                    <button class="filter-btn" data-status="In Progress">In Progress</button>
                    <button class="filter-btn" data-status="Completed">Completed</button>
                </div>

                <div class="sort-container" style="margin-bottom: 0; margin-left: auto;">
                    <button class="sort-btn" id="sortToggle"><i class="fas fa-arrow-down" id="sortIcon"> Date</i>
                    </button>
                </div>
            </div>

            <div id="history-grid" style="display: flex; flex-direction: column; gap: 2rem;">
                <p style="text-align:center; width:100%;">Loading history...</p>
            </div>
        </section>
    `;

    setupControls();
    await fetchHistory();
}

async function fetchHistory() {
    try {
        const q = query(collection(db, "workHistory"));
        const snapshot = await getDocs(q);
        historyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderHistory();
    } catch (error) {
        document.getElementById('history-grid').innerHTML = `<p style="text-align:center; width:100%;">Error loading data.</p>`;
        console.error(error);
    }
}

function renderHistory() {
    const grid = document.getElementById('history-grid');
    grid.innerHTML = '';

    let processed = historyData.filter(item => {
        let statusMatch = true;
        const isOngoing = item.endDate && item.endDate.toLowerCase().includes('in progress');
        
        if (currentStatusFilter === 'In Progress') {
            statusMatch = isOngoing;
        } else if (currentStatusFilter === 'Completed') {
            statusMatch = !isOngoing;
        }
        
        return statusMatch;
    });

    processed.sort((a, b) => {
        if(a.endDate === 'In Progress' && b.endDate !== 'In Progress') return -1;
        if(b.endDate === 'In Progress' && a.endDate !== 'In Progress') return 1;
        
        let dateA = new Date(a.endDate === 'In Progress' ? a.startDate : a.endDate).getTime();
        let dateB = new Date(b.endDate === 'In Progress' ? b.startDate : b.endDate).getTime();
        
        return sortDesc ? dateB - dateA : dateA - dateB;
    });

    if (processed.length === 0) {
        grid.innerHTML = `<p style="text-align:center; width:100%;">No records found.</p>`;
        return;
    }

    processed.forEach(item => {
        const formattedProblem = formatBulletPoints(item.problem);
        const formattedSolution = formatBulletPoints(item.solution);

        let feedbackHtml = '';
        if (item.feedback) {
            feedbackHtml = `
                <div class="card-section">
                    <span class="card-label">Client Feedback</span>
                    <div class="card-quote">"${item.feedback}"</div>
                </div>
            `;
        }

        grid.innerHTML += `
            <div class="data-card">
                <div class="card-header">
                    <h3 class="card-title">${item.title}</h3>
                    <span class="card-badge">${item.category}</span>
                </div>
                
                <div class="card-meta">
                    <i class="far fa-calendar-alt"></i> ${item.startDate} - ${item.endDate}
                </div>

                <div class="card-section">
                    <span class="card-label">Tech Stack</span>
                    <p class="card-text">${item.techStack}</p>
                </div>
                
                <div class="card-section">
                    <span class="card-label">The Problem</span>
                    ${formattedProblem}
                </div>

                <div class="card-section">
                    <span class="card-label">The Solution</span>
                    ${formattedSolution}
                </div>

                ${feedbackHtml}
            </div>
        `;
    });
}

function setupControls() {
    document.querySelectorAll('#status-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#status-filters .filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentStatusFilter = e.target.getAttribute('data-status');
            renderHistory();
        });
    });

    document.getElementById('sortToggle').addEventListener('click', () => {
        sortDesc = !sortDesc;
        const icon = document.getElementById('sortIcon');
        icon.className = sortDesc ? 'fas fa-arrow-down' : 'fas fa-arrow-up';
        renderHistory();
    });
}
