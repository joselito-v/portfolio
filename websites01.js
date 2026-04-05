// --- websites.js (Websites Module) ---
import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let websitesData = [];
let currentFilter = 'All';

export async function init(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <section>
            <h2 class="section-title">Websites & Projects</h2>
            
            <div class="filter-container" id="website-filters">
                <button class="filter-btn active" data-filter="All">ALL</button>
                <button class="filter-btn" data-filter="Client Websites">CLIENT WORK</button>
                <button class="filter-btn" data-filter="My Websites">MY PRODUCTS</button>
            </div>

            <div class="grid-container" id="websites-grid">
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

    const filtered = currentFilter === 'All' 
        ? websitesData 
        : websitesData.filter(site => site.type === currentFilter);

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="text-align:center; width:100%;">No projects found in this category.</p>`;
        return;
    }

    filtered.forEach(site => {
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
                    <p class="card-text">${site.problem}</p>
                </div>

                <div class="card-section">
                    <span class="card-label">Highlights</span>
                    <p class="card-text">${site.highlights}</p>
                </div>

                <div class="card-section">
                    <span class="card-label">Outcome</span>
                    <p class="card-text">${site.outcome}</p>
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
}
