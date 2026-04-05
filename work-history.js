// --- work-history.js (Work History Module)
import { db } from './firebase-config.js';
import { collection, getDocs, query } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let historyData = [];
let currentFilter = 'All';
let currentStatusFilter = 'All';
let sortDesc = true; 

export async function init(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <section>
            <h2 class="section-title">Work History</h2>
            
            <div class="filter-container" id="history-filters" style="margin-bottom: 1rem;">
                <button class="filter-btn active" data-filter="All">ALL</button>
                <button class="filter-btn" data-filter="Client Work">CLIENT WORK</button>
                <button class="filter-btn" data-filter="My Products">MY PRODUCTS</button>
            </div>

            <div class="filter-container" id="status-filters" style="margin-bottom: 2rem;">
                <button class="filter-btn active" data-status="All">All Status</button>
                <button class="filter-btn" data-status="In Progress">In Progress</button>
                <button class="filter-btn" data-status="Completed">Completed</button>
            </div>

            <div class="sort-container">
                <button class="sort-btn" id="sortToggle">
                    Sort by Date <i class="fas fa-arrow-down" id="sortIcon"></i>
                </button>
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
        const categoryMatch = currentFilter === 'All' ? true : item.category === currentFilter;
        
        let statusMatch = true;
        const isOngoing = item.endDate && item.endDate.toLowerCase().includes('in progress');
        
        if (currentStatusFilter === 'In Progress') {
            statusMatch = isOngoing;
        } else if (currentStatusFilter === 'Completed') {
            statusMatch = !isOngoing;
        }
        
        return categoryMatch && statusMatch;
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
        let formattedSolution = '';
        if (item.solution) {
            const solutionArray = item.solution.split('\n').filter(line => line.trim() !== "");
            
            const listItems = solutionArray.map(line => {
                const parts = line.split(':');
                if (parts.length > 1) {
                    const boldPart = parts[0];
                    const restPart = parts.slice(1).join(':');
                    return `<li style="margin-left: 1.5rem; margin-bottom: 0.5rem;"><strong>${boldPart.trim()}:</strong> ${restPart.trim()}</li>`;
                } else {
                    return `<li style="margin-left: 1.5rem; margin-bottom: 0.5rem;">${line.trim()}</li>`;
                }
            }).join('');
            
            formattedSolution = `<ul style="margin-top: 0.5rem; color: var(--text-light); font-size: 0.95rem;">${listItems}</ul>`;
        }

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
                    <p class="card-text">${item.problem}</p>
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
    document.querySelectorAll('#history-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#history-filters .filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderHistory();
        });
    });

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
