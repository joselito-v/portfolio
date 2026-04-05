// --- admin.js (Admin / Data Entry Module) ---
import { auth, db } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { collection, addDoc, setDoc, doc, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let websitesMap = {};
let historyMap = {};

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
                <button class="admin-nav-btn active" data-target="websites-form">Manage Websites</button>
                <button class="admin-nav-btn" data-target="history-form">Manage Work History</button>
                <button class="admin-nav-btn" data-target="user-form">Add User Auth</button>
            </div>

            <div id="websites-form" class="form-container admin-section">
                <h3>Add or Edit Website / Project</h3>
                
                <div class="form-group" style="margin-top: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0;">
                    <label>Load Existing Website (Select to Edit)</label>
                    <select id="wSelect" class="form-control">
                        <option value="">-- Create New Website --</option>
                    </select>
                </div>

                <form id="formAddWebsite" style="margin-top: 1rem;">
                    <input type="hidden" id="wId">
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
                    
                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" id="wSubmitBtn" class="btn btn-primary" style="flex: 1;">Save New Website</button>
                        <button type="button" id="wClearBtn" class="btn btn-outline" style="display: none;">Cancel Edit</button>
                    </div>
                </form>
            </div>

            <div id="history-form" class="form-container admin-section" style="display:none;">
                <h3>Add or Edit Work History</h3>
                
                <div class="form-group" style="margin-top: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0;">
                    <label>Load Existing Work History (Select to Edit)</label>
                    <select id="hSelect" class="form-control">
                        <option value="">-- Create New Work History --</option>
                    </select>
                </div>

                <form id="formAddHistory" style="margin-top: 1rem;">
                    <input type="hidden" id="hId">
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
                    
                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" id="hSubmitBtn" class="btn btn-primary" style="flex: 1;">Save Work History</button>
                        <button type="button" id="hClearBtn" class="btn btn-outline" style="display: none;">Cancel Edit</button>
                    </div>
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
    loadDropdownData();
}

async function loadDropdownData() {
    try {
        // Load Websites
        const wSnapshot = await getDocs(collection(db, "websites"));
        const wSelect = document.getElementById('wSelect');
        wSelect.innerHTML = '<option value="">-- Create New Website --</option>';
        websitesMap = {};
        wSnapshot.forEach(doc => {
            websitesMap[doc.id] = doc.data();
            wSelect.innerHTML += `<option value="${doc.id}">${doc.data().title}</option>`;
        });

        // Load Work History
        const hSnapshot = await getDocs(collection(db, "workHistory"));
        const hSelect = document.getElementById('hSelect');
        hSelect.innerHTML = '<option value="">-- Create New Work History --</option>';
        historyMap = {};
        hSnapshot.forEach(doc => {
            historyMap[doc.id] = doc.data();
            hSelect.innerHTML += `<option value="${doc.id}">${doc.data().title}</option>`;
        });
    } catch (error) {
        console.error("Error loading dropdown data:", error);
    }
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

    // Handle Website Selection for Edit
    document.getElementById('wSelect').addEventListener('change', (e) => {
        const id = e.target.value;
        if (id && websitesMap[id]) {
            const data = websitesMap[id];
            document.getElementById('wId').value = id;
            document.getElementById('wType').value = data.type || 'My Websites';
            document.getElementById('wTitle').value = data.title || '';
            document.getElementById('wTags').value = data.tags || '';
            document.getElementById('wProblem').value = data.problem || '';
            document.getElementById('wTech').value = data.techStack || '';
            document.getElementById('wHighlights').value = data.highlights || '';
            document.getElementById('wOutcome').value = data.outcome || '';
            document.getElementById('wUrl').value = data.url || '';
            
            document.getElementById('wSubmitBtn').textContent = "Update Website";
            document.getElementById('wClearBtn').style.display = "block";
        } else {
            resetWebsiteForm();
        }
    });

    // Cancel Website Edit
    document.getElementById('wClearBtn').addEventListener('click', resetWebsiteForm);

    function resetWebsiteForm() {
        document.getElementById('formAddWebsite').reset();
        document.getElementById('wId').value = '';
        document.getElementById('wSelect').value = '';
        document.getElementById('wSubmitBtn').textContent = "Save New Website";
        document.getElementById('wClearBtn').style.display = "none";
    }

    // Add or Edit Website
    document.getElementById('formAddWebsite').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('wId').value;
        const data = {
            type: document.getElementById('wType').value,
            title: document.getElementById('wTitle').value,
            tags: document.getElementById('wTags').value,
            problem: document.getElementById('wProblem').value,
            techStack: document.getElementById('wTech').value,
            highlights: document.getElementById('wHighlights').value,
            outcome: document.getElementById('wOutcome').value,
            url: document.getElementById('wUrl').value
        };

        try {
            if (id) {
                await updateDoc(doc(db, "websites", id), data);
                alert("Website updated successfully!");
            } else {
                await addDoc(collection(db, "websites"), data);
                alert("Website saved successfully!");
            }
            resetWebsiteForm();
            loadDropdownData(); // Refresh the list
        } catch (error) { alert("Error: " + error.message); }
    });

    // Handle Work History Selection for Edit
    document.getElementById('hSelect').addEventListener('change', (e) => {
        const id = e.target.value;
        if (id && historyMap[id]) {
            const data = historyMap[id];
            document.getElementById('hId').value = id;
            document.getElementById('hCategory').value = data.category || 'Client Work';
            document.getElementById('hTitle').value = data.title || '';
            document.getElementById('hStart').value = data.startDate || '';
            document.getElementById('hEnd').value = data.endDate || '';
            document.getElementById('hTech').value = data.techStack || '';
            document.getElementById('hProblem').value = data.problem || '';
            document.getElementById('hSolution').value = data.solution || '';
            document.getElementById('hFeedback').value = data.feedback || '';
            
            document.getElementById('hSubmitBtn').textContent = "Update Work History";
            document.getElementById('hClearBtn').style.display = "block";
        } else {
            resetHistoryForm();
        }
    });

    // Cancel Work History Edit
    document.getElementById('hClearBtn').addEventListener('click', resetHistoryForm);

    function resetHistoryForm() {
        document.getElementById('formAddHistory').reset();
        document.getElementById('hId').value = '';
        document.getElementById('hSelect').value = '';
        document.getElementById('hSubmitBtn').textContent = "Save Work History";
        document.getElementById('hClearBtn').style.display = "none";
    }

    // Add or Edit Work History
    document.getElementById('formAddHistory').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('hId').value;
        const data = {
            category: document.getElementById('hCategory').value,
            title: document.getElementById('hTitle').value,
            startDate: document.getElementById('hStart').value,
            endDate: document.getElementById('hEnd').value,
            techStack: document.getElementById('hTech').value,
            problem: document.getElementById('hProblem').value,
            solution: document.getElementById('hSolution').value,
            feedback: document.getElementById('hFeedback').value
        };

        try {
            if (id) {
                await updateDoc(doc(db, "workHistory", id), data);
                alert("Work History updated successfully!");
            } else {
                await addDoc(collection(db, "workHistory"), data);
                alert("Work History saved successfully!");
            }
            resetHistoryForm();
            loadDropdownData(); // Refresh the list
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
