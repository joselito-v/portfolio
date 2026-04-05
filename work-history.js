// --- work-history.js (Work History Module) ---
import { db } from './firebase-config.js';
import { collection, getDocs, query } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let historyData = [];
let currentStatusFilter = 'All';
let sortDesc = true; 

// Helper function to format text with newline split and bolding before colons
function formatBulletPoints(text) {
    if (!text) return '<p class="card-text"></p>';
    
    // Check if there are actual newlines, if not, just format as a single paragraph but check for colon
    if (!text.includes('\n')) {
        const parts = text.split(':');
        if (parts.length > 1) {
            const boldPart = parts[0];
            const restPart = parts.slice(1).join(':');
            return `<p class="card-text"><strong>${boldPart.trim()}:</strong> ${restPart.trim()}</p>`;
        }
        return `<p class="card-text">${text}</p>`;
    }

    const array = text.split('\n').filter(line => line.trim() !== "");
    const listItems = array.map(line => {
        const parts = line.split(':');
        if (parts.length > 1) {
            const boldPart = parts[0];
            const restPart = parts.slice(1).join(':');
            return `<li style="margin-left: 1.5rem; margin-bottom: 0.5rem;"><strong>${boldPart.trim()}:</strong> ${restPart.trim()}</li>`;
        } else {
            return `<li style="margin-left: 1.5rem; margin-bottom: 0.5rem;">${line.trim()}</li>`;
        }
    }).join('');
    
    return `<ul style="margin-top: 0.5rem; color: var(--text-light); font-size: 0.95rem;">${listItems}</ul>`;
}

export async function init(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <section>
            <h2 class="section-title">Work History</h2>

            <div style="position: sticky; top: 75px; background-color: var(--bg-light); z-index: 90; padding: 1rem 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
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
        // Use the new helper function for both problem and solution
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
