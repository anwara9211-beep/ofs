// Because the frontend runs in the user's browser, we use localhost. 
// Docker Compose binds port 5000 of the backend container to the host machine.
const API_URL = 'http://localhost:5000/api/feedback';

// Form Elements
const feedbackForm = document.getElementById('feedbackForm');
const formMessage = document.getElementById('formMessage');

if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Submitting...';
        submitBtn.disabled = true;

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            category: document.getElementById('category').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Hide form and show success modal
                const formContainer = document.getElementById('formContainer');
                const successModal = document.getElementById('successModal');
                if (formContainer && successModal) {
                    formContainer.style.display = 'none';
                    successModal.style.display = 'block';
                } else {
                    showMessage('Success: ' + data.message, 'success');
                }
                feedbackForm.reset();
            } else {
                showMessage('Error: ' + data.message, 'error');
            }
        } catch (error) {
            showMessage('Error: Could not connect to the server. Is the backend running?', 'error');
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });

    feedbackForm.addEventListener('reset', () => {
        if (formMessage) formMessage.className = 'message';
    });
}

function showMessage(msg, type) {
    if (!formMessage) return;
    formMessage.innerText = msg;
    formMessage.className = `message ${type}`;
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        formMessage.className = 'message';
    }, 5000);
}

function resetFeedbackForm() {
    const formContainer = document.getElementById('formContainer');
    const successModal = document.getElementById('successModal');
    if (formContainer) formContainer.style.display = 'block';
    if (successModal) successModal.style.display = 'none';
    if (formMessage) formMessage.className = 'message';
}

// Admin Panel Elements
const adminTableBody = document.getElementById('adminTableBody');
const loginContainer = document.getElementById('loginContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const adminLoginForm = document.getElementById('adminLoginForm');
const loginMessage = document.getElementById('loginMessage');

// Admin Auth State
let adminToken = localStorage.getItem('adminToken');

// Pagination State
let allFeedbacks = [];
let currentPage = 1;
const itemsPerPage = 5;

if (adminTableBody) {
    if (adminToken) {
        showDashboard();
    } else {
        showLogin();
    }
}

if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const originalText = loginBtn.innerText;
        
        loginBtn.innerText = 'Logging in...';
        loginBtn.disabled = true;

        try {
            // Re-use API_URL host to avoid hardcoding localhost issues
            const loginUrl = API_URL.replace('/api/feedback', '/api/admin/login');
            
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                adminToken = data.token;
                localStorage.setItem('adminToken', data.token);
                showDashboard();
            } else {
                showLoginError(data.message || 'Invalid credentials');
            }
        } catch (error) {
            showLoginError('Could not connect to the server.');
        } finally {
            loginBtn.innerText = originalText;
            loginBtn.disabled = false;
        }
    });
}

function showLogin() {
    if (loginContainer) loginContainer.style.display = 'block';
    if (dashboardContainer) dashboardContainer.style.display = 'none';
}

function showDashboard() {
    if (loginContainer) loginContainer.style.display = 'none';
    if (dashboardContainer) dashboardContainer.style.display = 'block';
    fetchFeedback();
}

function logoutAdmin() {
    adminToken = null;
    localStorage.removeItem('adminToken');
    showLogin();
}

function showLoginError(msg) {
    if (!loginMessage) return;
    loginMessage.innerText = msg;
    loginMessage.style.color = 'var(--error)';
    loginMessage.style.display = 'block';
    
    setTimeout(() => {
        loginMessage.style.display = 'none';
    }, 5000);
}

async function fetchFeedback() {
    if (!adminTableBody) return;
    
    // Show spinner while reloading
    adminTableBody.innerHTML = `<tr><td colspan="5"><div class="loading-spinner"><div class="spinner"></div></div></td></tr>`;
    
    try {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        const data = await response.json();

        if (response.status === 401) {
            logoutAdmin();
            showLoginError('Session expired. Please log in again.');
            return;
        }

        if (data.success) {
            allFeedbacks = data.data;
            currentPage = 1;
            renderTable();
        } else {
            adminTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--error);">Error loading data: ${escapeHTML(data.message || '')}</td></tr>`;
        }
    } catch (error) {
        adminTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--error);">Failed to connect to server. Ensure backend is running.</td></tr>`;
    }
}

function renderTable() {
    if (!allFeedbacks || allFeedbacks.length === 0) {
        adminTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No feedback received yet.</td></tr>`;
        const paginationContainer = document.getElementById('paginationControls');
        if (paginationContainer) paginationContainer.innerHTML = '';
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedItems = allFeedbacks.slice(start, end);

    const html = paginatedItems.map(fb => {
        const date = new Date(fb.createdAt).toLocaleString();
        let badgeClass = 'badge-suggestion';
        if (fb.category === 'Complaint') badgeClass = 'badge-complaint';
        else if (fb.category === 'Website Feedback') badgeClass = 'badge-website';
        else if (fb.category === 'Service Feedback') badgeClass = 'badge-service';

        return `
            <tr>
                <td><strong>${escapeHTML(fb.name)}</strong></td>
                <td><a href="mailto:${escapeHTML(fb.email)}" style="color: var(--primary-color); text-decoration: none;">${escapeHTML(fb.email)}</a></td>
                <td><span class="badge ${badgeClass}">${escapeHTML(fb.category)}</span></td>
                <td>${escapeHTML(fb.message)}</td>
                <td style="color: var(--text-muted); font-size: 0.875rem;">${date}</td>
            </tr>
        `;
    }).join('');

    adminTableBody.innerHTML = html;
    renderPagination();
}

function renderPagination() {
    const totalPages = Math.ceil(allFeedbacks.length / itemsPerPage);
    const paginationContainer = document.getElementById('paginationControls');
    
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    paginationContainer.innerHTML = `
        <button onclick="changePage(-1)" class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.875rem; margin-right: 1rem;" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span style="color: var(--text-muted); font-size: 0.875rem;">Page <strong>${currentPage}</strong> of ${totalPages}</span>
        <button onclick="changePage(1)" class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.875rem; margin-left: 1rem;" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;
}

// Ensure this function is attached to window so inline onclick can see it
window.changePage = function(dir) {
    currentPage += dir;
    renderTable();
};

// Security: Prevent XSS when displaying user input
function escapeHTML(str) {
    if (!str) return '';
    return str.toString().replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
