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

// Load invoices
async function loadInvoices(status = '') {
    try {
        const url = status ? `${API_URL}/invoices?status=${status}` : `${API_URL}/invoices`;
        const response = await fetch(url, { headers });
        const data = await response.json();

        if (data.success) {
            displayInvoices(data.invoices);
        }
    } catch (error) {
        console.error('Error loading invoices:', error);
    }
}

// Display invoices
function displayInvoices(invoices) {
    const tbody = document.getElementById('invoicesList');

    if (invoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No invoices found</td></tr>';
        return;
    }

    tbody.innerHTML = invoices.map(invoice => {
        const date = new Date(invoice.createdAt).toLocaleDateString();
        return `
            <tr>
                <td>${invoice.invoiceNumber}</td>
                <td>${invoice.customerName}</td>
                <td>${date}</td>
                <td>₹${invoice.total.toFixed(2)}</td>
                <td><span class="status-badge status-${invoice.status}">${invoice.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="updateInvoiceStatus('${invoice._id}', 'paid')">
                        Mark Paid
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="deleteInvoice('${invoice._id}')">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter invoices
function filterInvoices() {
    const status = document.getElementById('statusFilter').value;
    loadInvoices(status);
}

// Show create invoice modal
function showCreateInvoiceModal() {
    document.getElementById('createInvoiceModal').classList.add('show');
}

// Close modal
function closeModal() {
    document.getElementById('createInvoiceModal').classList.remove('show');
    document.getElementById('createInvoiceForm').reset();
}

// Add item to invoice
function addItem() {
    const itemsContainer = document.getElementById('invoiceItems');
    const newItem = document.createElement('div');
    newItem.className = 'invoice-item';
    newItem.innerHTML = `
        <input type="text" placeholder="Item Name" name="itemName[]" required>
        <input type="number" placeholder="Quantity" name="itemQuantity[]" min="1" required>
        <input type="number" placeholder="Price" name="itemPrice[]" min="0" step="0.01" required>
        <button type="button" class="btn btn-sm btn-secondary" onclick="this.parentElement.remove()">X</button>
    `;
    itemsContainer.appendChild(newItem);
}

// Create invoice
document.getElementById('createInvoiceForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const itemNames = formData.getAll('itemName[]');
    const itemQuantities = formData.getAll('itemQuantity[]');
    const itemPrices = formData.getAll('itemPrice[]');

    const items = itemNames.map((name, index) => ({
        name,
        quantity: parseInt(itemQuantities[index]),
        price: parseFloat(itemPrices[index])
    }));

    const invoiceData = {
        customerName: formData.get('customerName'),
        customerEmail: formData.get('customerEmail'),
        customerPhone: formData.get('customerPhone'),
        customerAddress: formData.get('customerAddress'),
        items,
        taxRate: parseFloat(formData.get('taxRate')) || 0,
        discount: parseFloat(formData.get('discount')) || 0,
        dueDate: formData.get('dueDate'),
        notes: formData.get('notes')
    };

    try {
        const response = await fetch(`${API_URL}/invoices`, {
            method: 'POST',
            headers,
            body: JSON.stringify(invoiceData)
        });

        const data = await response.json();

        if (data.success) {
            closeModal();
            loadInvoices();
            alert('Invoice created successfully!');
        } else {
            alert(data.message || 'Failed to create invoice');
        }
    } catch (error) {
        console.error('Error creating invoice:', error);
        alert('An error occurred');
    }
});

// Update invoice status
async function updateInvoiceStatus(id, status) {
    try {
        const response = await fetch(`${API_URL}/invoices/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ status, paidDate: status === 'paid' ? new Date() : null })
        });

        const data = await response.json();

        if (data.success) {
            loadInvoices();
            alert('Invoice updated successfully!');
        }
    } catch (error) {
        console.error('Error updating invoice:', error);
    }
}

// Delete invoice
async function deleteInvoice(id) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
        const response = await fetch(`${API_URL}/invoices/${id}`, {
            method: 'DELETE',
            headers
        });

        const data = await response.json();

        if (data.success) {
            loadInvoices();
            alert('Invoice deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting invoice:', error);
    }
}

// Initialize
loadInvoices();
