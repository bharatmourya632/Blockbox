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

let allItems = [];

// Load inventory
async function loadInventory() {
    try {
        const response = await fetch(`${API_URL}/inventory`, { headers });
        const data = await response.json();

        if (data.success) {
            allItems = data.items;
            displayInventory(data.items);
            updateStats(data);
            loadCategories();
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

// Display inventory
function displayInventory(items) {
    const tbody = document.getElementById('inventoryList');

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No items found</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => {
        const totalValue = item.quantity * item.price;
        const lowStock = item.quantity <= item.lowStockAlert;
        return `
            <tr style="${lowStock ? 'background-color: #fee2e2;' : ''}">
                <td>${item.name}</td>
                <td>${item.sku || '-'}</td>
                <td>${item.category}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>₹${totalValue.toFixed(2)}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="editItem('${item._id}')">Edit</button>
                    <button class="btn btn-sm btn-secondary" onclick="deleteItem('${item._id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Update stats
function updateStats(data) {
    document.getElementById('totalItems').textContent = data.count;
    document.getElementById('totalValue').textContent = `₹${data.totalValue.toFixed(2)}`;

    const lowStockItems = allItems.filter(item => item.quantity <= item.lowStockAlert).length;
    document.getElementById('lowStockItems').textContent = lowStockItems;
}

// Load categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/inventory/stats/categories`, { headers });
        const data = await response.json();

        if (data.success) {
            const select = document.getElementById('categoryFilter');
            select.innerHTML = '<option value="">All Categories</option>';
            data.categories.forEach(category => {
                select.innerHTML += `<option value="${category}">${category}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Search inventory
function searchInventory() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allItems.filter(item =>
        item.name.toLowerCase().includes(search) ||
        (item.sku && item.sku.toLowerCase().includes(search))
    );
    displayInventory(filtered);
}

// Filter inventory
function filterInventory() {
    const category = document.getElementById('categoryFilter').value;
    const filtered = category
        ? allItems.filter(item => item.category === category)
        : allItems;
    displayInventory(filtered);
}

// Show add item modal
function showAddItemModal() {
    document.getElementById('addItemModal').classList.add('show');
}

// Close modal
function closeModal() {
    document.getElementById('addItemModal').classList.remove('show');
    document.getElementById('addItemForm').reset();
}

// Add item
document.getElementById('addItemForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const itemData = {
        name: formData.get('name'),
        description: formData.get('description'),
        sku: formData.get('sku'),
        category: formData.get('category'),
        quantity: parseInt(formData.get('quantity')),
        price: parseFloat(formData.get('price')),
        costPrice: parseFloat(formData.get('costPrice')) || 0,
        unit: formData.get('unit'),
        lowStockAlert: parseInt(formData.get('lowStockAlert'))
    };

    try {
        const response = await fetch(`${API_URL}/inventory`, {
            method: 'POST',
            headers,
            body: JSON.stringify(itemData)
        });

        const data = await response.json();

        if (data.success) {
            closeModal();
            loadInventory();
            alert('Item added successfully!');
        } else {
            alert(data.message || 'Failed to add item');
        }
    } catch (error) {
        console.error('Error adding item:', error);
        alert('An error occurred');
    }
});

// Edit item
async function editItem(id) {
    const newQuantity = prompt('Enter new quantity:');
    if (newQuantity === null) return;

    try {
        const response = await fetch(`${API_URL}/inventory/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify({ quantity: parseInt(newQuantity) })
        });

        const data = await response.json();

        if (data.success) {
            loadInventory();
            alert('Item updated successfully!');
        }
    } catch (error) {
        console.error('Error updating item:', error);
    }
}

// Delete item
async function deleteItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
        const response = await fetch(`${API_URL}/inventory/${id}`, {
            method: 'DELETE',
            headers
        });

        const data = await response.json();

        if (data.success) {
            loadInventory();
            alert('Item deleted successfully!');
        }
    } catch (error) {
        console.error('Error deleting item:', error);
    }
}

// Initialize
loadInventory();
