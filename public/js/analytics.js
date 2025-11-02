const API_URL = '/api';

const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
};

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Load analytics
async function loadAnalytics() {
    try {
        const response = await fetch(`${API_URL}/sales/analytics`, { headers });
        const data = await response.json();

        if (data.success) {
            const analytics = data.analytics;

            // Update stats
            document.getElementById('totalRevenue').textContent =
                `₹${analytics.totalRevenue.toFixed(2)}`;
            document.getElementById('pendingAmount').textContent =
                `₹${analytics.pendingAmount.toFixed(2)}`;
            document.getElementById('totalInvoices').textContent = analytics.totalInvoices;
            document.getElementById('avgInvoiceValue').textContent =
                `₹${analytics.avgInvoiceValue.toFixed(2)}`;

            // Update status stats
            document.getElementById('draftCount').textContent = analytics.invoicesByStatus.draft;
            document.getElementById('sentCount').textContent = analytics.invoicesByStatus.sent;
            document.getElementById('paidCount').textContent = analytics.invoicesByStatus.paid;
            document.getElementById('cancelledCount').textContent = analytics.invoicesByStatus.cancelled;

            // Display top customers
            displayTopCustomers(analytics.topCustomers);

            // Display monthly revenue chart (simple text version)
            displayMonthlyRevenue(analytics.monthlyRevenue);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

// Display top customers
function displayTopCustomers(customers) {
    const tbody = document.getElementById('topCustomers');

    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">No data available</td></tr>';
        return;
    }

    tbody.innerHTML = customers.slice(0, 10).map(customer => `
        <tr>
            <td>${customer.name}</td>
            <td>${customer.invoiceCount}</td>
            <td>₹${customer.totalRevenue.toFixed(2)}</td>
        </tr>
    `).join('');
}

// Display monthly revenue (simple version without chart library)
function displayMonthlyRevenue(monthlyData) {
    const chartContainer = document.getElementById('revenueChart');

    if (!monthlyData || monthlyData.length === 0) {
        chartContainer.innerHTML = '<p class="text-center">No data available</p>';
        return;
    }

    // Create simple bar chart using HTML/CSS
    const maxRevenue = Math.max(...monthlyData.map(m => m.revenue));

    chartContainer.innerHTML = `
        <div style="display: flex; align-items: flex-end; gap: 8px; height: 250px; padding: 20px;">
            ${monthlyData.map(month => {
                const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 200 : 0;
                return `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                        <div style="font-size: 12px; margin-bottom: 5px; font-weight: bold;">
                            ₹${month.revenue.toFixed(0)}
                        </div>
                        <div style="
                            width: 100%;
                            height: ${height}px;
                            background: linear-gradient(to top, #4f46e5, #818cf8);
                            border-radius: 4px 4px 0 0;
                            transition: all 0.3s;
                        "></div>
                        <div style="font-size: 10px; margin-top: 5px; text-align: center;">
                            ${month.month}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Load sales history
async function loadSalesHistory() {
    try {
        const response = await fetch(`${API_URL}/sales/history?limit=10`, { headers });
        const data = await response.json();

        if (data.success) {
            displaySalesHistory(data.history);
        }
    } catch (error) {
        console.error('Error loading sales history:', error);
    }
}

// Display sales history
function displaySalesHistory(history) {
    const tbody = document.getElementById('salesHistory');

    if (history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No sales history</td></tr>';
        return;
    }

    tbody.innerHTML = history.map(sale => {
        const date = new Date(sale.paidDate || sale.createdAt).toLocaleDateString();
        return `
            <tr>
                <td>${sale.invoiceNumber}</td>
                <td>${sale.customerName}</td>
                <td>₹${sale.total.toFixed(2)}</td>
                <td>${date}</td>
            </tr>
        `;
    }).join('');
}

// Initialize
loadAnalytics();
loadSalesHistory();
