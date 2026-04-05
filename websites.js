// --- websites.js (Websites Module) ---
import { db } from './firebase-config.js';
import { collection, getDocs, query } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let websitesData = [];
let currentFilter = 'All';
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
            <h2 class="section-title">Websites & Projects</h2>
            
            <div style="position: sticky; top: 75px; background-color: var(--bg-light); z-index: 90; padding: 1rem 0.5rem; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div id="website-filters" style="display: flex; gap: 1rem 0.2rem; flex-wrap: wrap;">
                    <button class="filter-btn active" data-filter="All">All Websites</button>
                    <button class="filter-btn" data-filter="Client Websites">Client Websites</button>
                    <button class="filter-btn" data-filter="My Websites">My Websites</button>
                </div>

                <div class="sort-container" style="margin-bottom: 0; margin-left: auto;">
                    <button class="sort-btn" id="sortToggle">
                        Date <i class="fas fa-arrow-down" id="sortIcon"></i>
                    </button>
                </div>
            </div>

            <div id="websites-grid" style="display: flex; flex-direction: column; gap: 2rem;">
                <p style="text-align:center; width:100%;">Loading projects...</p>
            </div>
        </section>
    `;

    setupFilters();
    await fetchWebsites();
}

async function fetchWebsites() {
    try {
        const q = query(collection(db, "websites"));
        const snapshot = await getDocs(q);
        websitesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderWebsites();
    } catch (error) {
        document.getElementById('websites-grid').innerHTML = `<p style="text-align:center; width:100%;">Error loading data.</p>`;
        console.error(error);
    }
}

function renderWebsites() {
    const grid = document.getElementById('websites-grid');
    grid.innerHTML = '';

    let filtered = currentFilter === 'All' 
        ? [...websitesData] 
        : websitesData.filter(site => site.type === currentFilter);

    // Sorting logic (defaults to sorting alphabetically by title if no date field exists in your schema)
    filtered.sort((a, b) => {
        let valA = a.title ? a.title.toLowerCase() : '';
        let valB = b.title ? b.title.toLowerCase() : '';
        
        if (valA < valB) return sortDesc ? 1 : -1;
        if (valA > valB) return sortDesc ? -1 : 1;
        return 0;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="text-align:center; width:100%;">No projects found in this category.</p>`;
        return;
    }

    filtered.forEach(site => {
        const formattedProblem = formatBulletPoints(site.problem);
        const formattedHighlights = formatBulletPoints(site.highlights);
        const formattedOutcome = formatBulletPoints(site.outcome);

        grid.innerHTML += `
            <div class="data-card">
                <div class="card-header">
                    <h3 class="card-title">${site.title}</h3>
                    <span class="card-badge">${site.type}</span>
                </div>
                
                <div class="card-section">
                    <span class="card-label">Tech Stack</span>
                    <p class="card-text"><i class="fas fa-code"></i> ${site.techStack}</p>
                </div>
                
                <div class="card-section">
                    <span class="card-label">The Problem</span>
                    ${formattedProblem}
                </div>

                <div class="card-section">
                    <span class="card-label">Highlights</span>
                    ${formattedHighlights}
                </div>

                <div class="card-section">
                    <span class="card-label">Outcome</span>
                    ${formattedOutcome}
                </div>

                <div class="card-section" style="margin-top: 1.5rem;">
                    <span style="font-size: 0.85rem; color: var(--text-light);"><i class="fas fa-tags"></i> ${site.tags}</span>
                </div>
                
                ${site.url ? `<a href="${site.url}" target="_blank" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size:0.9rem; margin-top:1rem;">View Live URL</a>` : ''}
            </div>
        `;
    });
}

function setupFilters() {
    document.querySelectorAll('#website-filters .filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('#website-filters .filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.getAttribute('data-filter');
            renderWebsites();
        });
    });

    document.getElementById('sortToggle').addEventListener('click', () => {
        sortDesc = !sortDesc;
        const icon = document.getElementById('sortIcon');
        icon.className = sortDesc ? 'fas fa-arrow-down' : 'fas fa-arrow-up';
        renderWebsites();
    });
}
