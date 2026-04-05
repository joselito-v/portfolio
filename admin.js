// --- admin.js (Admin / Data Entry Module) ---
import { auth, db } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { collection, addDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export function init(containerId) {
    const container = document.getElementById(containerId);
    
    // Security check
    if (!auth.currentUser) {
        window.location.hash = '#login';
        return;
    }

    container.innerHTML = `
        <section>
            <h2 class="section-title">Admin Dashboard</h2>
            <div style="text-align:center; margin-bottom: 2rem;">
                <p>Logged in as: ${auth.currentUser.email}</p>
                <button id="logoutBtn" class="btn btn-outline" style="padding: 0.5rem 1rem; margin-top:1rem;">Logout</button>
            </div>

            <div class="admin-nav">
                <button class="admin-nav-btn active" data-target="websites-form">Add Website</button>
                <button class="admin-nav-btn" data-target="history-form">Add Work History</button>
                <button class="admin-nav-btn" data-target="user-form">Add User Auth</button>
            </div>

            <div id="websites-form" class="form-container admin-section">
                <h3>Add New Website / Project</h3>
                <form id="formAddWebsite" style="margin-top: 1rem;">
                    <div class="form-group">
                        <label>Type</label>
                        <select id="wType" class="form-control" required>
                            <option value="My Websites">My Websites</option>
                            <option value="Client Websites">Client Websites</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Title</label><input type="text" id="wTitle" class="form-control" required></div>
                    <div class="form-group"><label>Tags (Comma separated)</label><input type="text" id="wTags" class="form-control"></div>
                    <div class="form-group"><label>Problem Statement</label><textarea id="wProblem" class="form-control" required></textarea></div>
                    <div class="form-group"><label>Tech Stack</label><input type="text" id="wTech" class="form-control" required></div>
                    <div class="form-group"><label>Highlights</label><textarea id="wHighlights" class="form-control" required></textarea></div>
                    <div class="form-group"><label>Outcome</label><textarea id="wOutcome" class="form-control" required></textarea></div>
                    <div class="form-group"><label>Live URL (Optional)</label><input type="url" id="wUrl" class="form-control"></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Save Website</button>
                </form>
            </div>

            <div id="history-form" class="form-container admin-section" style="display:none;">
                <h3>Add Work History</h3>
                <form id="formAddHistory" style="margin-top: 1rem;">
                    <div class="form-group">
                        <label>Category</label>
                        <select id="hCategory" class="form-control" required>
                            <option value="Client Work">Client Work</option>
                            <option value="My Products">My Products</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Project Title</label><input type="text" id="hTitle" class="form-control" required></div>
                    <div class="form-group" style="display:flex; gap: 1rem;">
                        <div style="flex:1"><label>Start Date</label><input type="month" id="hStart" class="form-control" required></div>
                        <div style="flex:1"><label>End Date</label><input type="text" id="hEnd" class="form-control" placeholder="e.g. YYYY-MM or In Progress" required></div>
                    </div>
                    <div class="form-group"><label>Tech Stack / Icons</label><input type="text" id="hTech" class="form-control" required></div>
                    <div class="form-group"><label>The Problem</label><textarea id="hProblem" class="form-control" required></textarea></div>
                    <div class="form-group"><label>The Solution</label><textarea id="hSolution" class="form-control" required></textarea></div>
                    <div class="form-group"><label>Client Feedback (Optional)</label><textarea id="hFeedback" class="form-control"></textarea></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Save Work History</button>
                </form>
            </div>

            <div id="user-form" class="form-container admin-section" style="display:none;">
                <h3>Add System User Data to Firestore</h3>
                <p style="font-size: 0.85rem; color: var(--text-light); margin-bottom: 1rem;">Note: This saves the profile data. Auth credentials must be created via Firebase Console or Auth API separately.</p>
                <form id="formAddUser" style="margin-top: 1rem;">
                    <div class="form-group"><label>Auth UID (from Firebase Auth)</label><input type="text" id="uUid" class="form-control" required></div>
                    <div class="form-group"><label>Email</label><input type="email" id="uEmail" class="form-control" required></div>
                    <div class="form-group">
                        <label>Role</label>
                        <select id="uRole" class="form-control" required>
                            <option value="superAdmin">superAdmin</option>
                            <option value="admin">admin</option>
                            <option value="standard">standard</option>
                            <option value="client">client</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Company ID (Reference)</label><input type="text" id="uCompany" class="form-control" required></div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Save User Data</button>
                </form>
            </div>
        </section>
    `;

    setupAdminLogic();
}

function setupAdminLogic() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await signOut(auth);
    });

    // Tab Navigation
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-section').forEach(s => s.style.display = 'none');
            
            e.target.classList.add('active');
            document.getElementById(e.target.getAttribute('data-target')).style.display = 'block';
        });
    });

    // Add Website
    document.getElementById('formAddWebsite').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "websites"), {
                type: document.getElementById('wType').value,
                title: document.getElementById('wTitle').value,
                tags: document.getElementById('wTags').value,
                problem: document.getElementById('wProblem').value,
                techStack: document.getElementById('wTech').value,
                highlights: document.getElementById('wHighlights').value,
                outcome: document.getElementById('wOutcome').value,
                url: document.getElementById('wUrl').value
            });
            alert("Website saved!");
            e.target.reset();
        } catch (error) { alert("Error: " + error.message); }
    });

    // Add Work History
    document.getElementById('formAddHistory').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "workHistory"), {
                category: document.getElementById('hCategory').value,
                title: document.getElementById('hTitle').value,
                startDate: document.getElementById('hStart').value,
                endDate: document.getElementById('hEnd').value,
                techStack: document.getElementById('hTech').value,
                problem: document.getElementById('hProblem').value,
                solution: document.getElementById('hSolution').value,
                feedback: document.getElementById('hFeedback').value
            });
            alert("Work History saved!");
            e.target.reset();
        } catch (error) { alert("Error: " + error.message); }
    });

    // Add User Profile Document
    document.getElementById('formAddUser').addEventListener('submit', async (e) => {
        e.preventDefault();
        const uid = document.getElementById('uUid').value;
        try {
            await setDoc(doc(db, "users", uid), {
                email: document.getElementById('uEmail').value,
                role: document.getElementById('uRole').value,
                companyId: document.getElementById('uCompany').value,
                createdAt: new Date().toISOString()
            });
            alert("User profile saved to Firestore!");
            e.target.reset();
        } catch (error) { alert("Error: " + error.message); }
    });
}
