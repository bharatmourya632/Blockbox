const API_URL = '/api';

// Check authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Load user info
function loadUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.name;
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_URL}/sales/dashboard`, { headers });
        const data = await response.json();

        if (data.success) {
            const dashboard = data.dashboard;

            // Update stats
            document.getElementById('thisMonthRevenue').textContent =
                `₹${dashboard.thisMonthRevenue.toFixed(2)}`;
            document.getElementById('lastMonthRevenue').textContent =
                `₹${dashboard.lastMonthRevenue.toFixed(2)}`;
            document.getElementById('totalInvoices').textContent = dashboard.totalInvoices;
            document.getElementById('pendingInvoices').textContent = dashboard.pendingInvoices;

            // Update growth indicator
            const growthElement = document.getElementById('revenueGrowth');
            const growth = parseFloat(dashboard.revenueGrowth);
            growthElement.textContent = `${growth >= 0 ? '+' : ''}${growth}%`;
            growthElement.className = growth >= 0 ? 'stat-change' : 'stat-change negative';

            // Load recent invoices
            loadRecentInvoices(dashboard.recentInvoices);
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load recent invoices
function loadRecentInvoices(invoices) {
    const tbody = document.getElementById('recentInvoices');

    if (invoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No invoices yet</td></tr>';
        return;
    }

    tbody.innerHTML = invoices.map(invoice => `
        <tr>
            <td>${invoice.invoiceNumber}</td>
            <td>${invoice.customerName}</td>
            <td>₹${invoice.total.toFixed(2)}</td>
            <td><span class="status-badge status-${invoice.status}">${invoice.status}</span></td>
        </tr>
    `).join('');
}

// Initialize
loadUserInfo();
loadDashboardData();
