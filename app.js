// app.js – status change and filter implementation
const STORAGE_KEY = "measurements";
let currentMeasurementId = null;
let currentFilter = "Sve"; // default filter

document.addEventListener('DOMContentLoaded', () => {
    const newMeasurementBtn = document.getElementById('newMeasurementBtn');
    const modal = document.getElementById('modal');
    const startBtn = document.getElementById('startBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const measurementsContainer = document.getElementById('measurementsContainer');

    const loadMeasurements = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
};

const saveMeasurements = (measurements) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(measurements));
};

const renderMeasurements = () => {
    const measurements = loadMeasurements();
    const filtered = measurements
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter(m => {
            if (currentFilter === "Sve") return true;
            const status = m.status ?? "Mjereno";
            return status === currentFilter;
        });
    measurementsContainer.innerHTML = '';
    filtered.forEach(m => {
        const card = document.createElement('div');
        card.className = 'measurement-card';
        card.dataset.id = m.id;
        const statusText = m.status || "Mjereno";
        card.innerHTML = `
            <strong>${m.projectName}</strong><br>
            Ime Klijenta: ${m.customerName}<br>
            Datum: ${new Date(m.createdAt).toLocaleDateString()}<br>
            Tel: <a href="tel:${m.phone}">${m.phone}</a><br>
            Status: ${statusText}<br>
            <button class="delete-measurement danger" data-id="${m.id}">Obriši Mjerenje</button>
        `;
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-measurement')) return;
            showDetails(m.id);
        });
        card.querySelector('.delete-measurement').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Obrisati ovo mjerenje?')) {
                const remaining = loadMeasurements().filter(meas => meas.id !== m.id);
                saveMeasurements(remaining);
                renderMeasurements();
            }
        });
        measurementsContainer.appendChild(card);
    });
};

const calculateTotals = (measurement) => {
    const totalArea = measurement.products.reduce((sum, p) => sum + p.area, 0);
    const totalPrice = measurement.products.reduce((sum, p) => sum + p.price, 0);
    return { totalArea, totalPrice };
};

const renderTotals = (measurement) => {
    const { totalArea, totalPrice } = calculateTotals(measurement);
    document.getElementById('totalArea').textContent = totalArea.toFixed(2);
    document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
};

const showDetails = (id) => {
    currentMeasurementId = id;
    const measurement = loadMeasurements().find(m => m.id === id);
    if (!measurement) return;

    measurementsContainer.innerHTML = `
        <h3>${measurement.projectName}</h3>
        <p><strong>Ime Klijenta:</strong> ${measurement.customerName}</p>
        <p><strong>Broj Telefona:</strong> <a href="tel:${measurement.phone}">${measurement.phone}</a></p>
        <p><strong>Datum:</strong> ${new Date(measurement.createdAt).toLocaleString()}</p>
        <label>Status:
                <select id="statusSelect">
                    <option value="Mjereno">Mjereno</option>
                    <option value="Napravljeno">Napravljeno</option>
                    <option value="Montirano">Montirano</option>
                    <option value="Placeno">Placeno</option>
                </select>
        </label>
        <hr>
        <h4>Dodaj Proizvod</h4>
        <form id="productForm">
            <label>Vrsta Proizvoda:
                <select id="productType">
                    <option value="Komarnik">Komarnik</option>
                    <option value="Skrin zavjesa">Skrin zavjesa</option>
                    <option value="Venecijaner">Venecijaner</option>
                    <option value="Zebra zavjesa">Zebra zavjesa</option>
                </select>
            </label>
            <div id="extraKomarnikOptions" style="display:none; margin-top:0.5rem;">
                <label>Boja:
                    <select id="komarnikColor">
                        <option value="Bijeli">Bijeli</option>
                        <option value="Antracit">Antracit</option>
                        <option value="Sivi">Sivi</option>
                        <option value="Braon">Braon</option>
                        <option value="Zlatni Hrast">Zlatni Hrast</option>
                        <option value="Crni">Crni</option>
                        <option value="Zeleni">Zeleni</option>
                        <option value="Bež">Bež</option>
                    </select>
                </label>
                <label>Tip:
                    <select id="komarnikStyle">
                        <option value="Normalni">Normalni</option>
                        <option value="Prag Lajsna">Prag Lajsna</option>
                    </select>
                </label>
            </div>
            <div style="margin-top: 0.5rem;">
                <label>Cijena po m² (€):
                    <input type="number" id="productPricePerM2" step="0.01" min="0">
                </label>
            </div>
            <label>Širina (cm):
                <input type="number" id="productWidth" min="0" step="0.01" required>
            </label>
            <label>Visina (cm):
                <input type="number" id="productHeight" min="0" step="0.01" required>
            </label>
            <label>Napomena:
                <input type="text" id="productNote" placeholder="Opcionalna napomena">
            </label>
            <button type="button" id="addProductBtn" class="primary">Dodaj</button>
        </form>
        <h4>Proizvodi</h4>
        <table id="productsTable" border="1" cellpadding="4" cellspacing="0">
            <tr>
                <th>Vrsta</th><th>Boja</th><th>Tip</th><th>Širina (cm)</th><th>Visina (cm)</th>
                <th>Kvadratura (m²)</th><th>Napomena</th><th>Cijena (€)</th><th>Obriši</th>
            </tr>
            ${measurement.products.map(p => `
                <tr>
                    <td>${p.type}</td>
                    <td>${p.color || ''}</td>
                    <td>${p.style || ''}</td>
                    <td>${p.width}</td>
                    <td>${p.height}</td>
                <td>${p.area.toFixed(2)}</td>
                <td>${p.note || ''}</td>
                <td>${p.price.toFixed(2)}</td>
                <td><button class="delete-product danger" data-id="${p.id}">Obriši</button></td>
                </tr>`).join('')}
        </table>
        <div style="margin-top:10px;">
            <strong>Ukupna Kvadratura (m²): </strong><span id="totalArea">0</span><br>
            <strong>Ukupna Cijena (€): </strong><span id="totalPrice">0</span>
        </div>
        <button id="backBtn" style="margin-top:10px;">Nazad</button>
    `;

    renderTotals(measurement);
    document.getElementById('statusSelect').value = measurement.status || "Mjereno";

    document.getElementById('backBtn').onclick = renderMeasurements;

    // Status change handler
    document.getElementById('statusSelect').onchange = () => {
        const newStatus = document.getElementById('statusSelect').value;
        const measurements = loadMeasurements();
        const m = measurements.find(meas => meas.id === currentMeasurementId);
        if (m) {
            m.status = newStatus;
            saveMeasurements(measurements);
        }
    };

    const productTypeSelect = document.getElementById('productType');
    const extraOptionsDiv = document.getElementById('extraKomarnikOptions');
    const toggleKomarnikOptions = () => {
        if (productTypeSelect.value === 'Komarnik') {
            extraOptionsDiv.style.display = 'block';
        } else {
            extraOptionsDiv.style.display = 'none';
        }
    };
    productTypeSelect.addEventListener('change', toggleKomarnikOptions);
    toggleKomarnikOptions();

    document.getElementById('addProductBtn').onclick = () => {
        const type = productTypeSelect.value;
        const width = parseFloat(document.getElementById('productWidth').value);
        const height = parseFloat(document.getElementById('productHeight').value);
        const pricePerM2 = parseFloat(document.getElementById('productPricePerM2').value);
        
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            alert('Širina i visina moraju biti pozitivni brojevi.');
            return;
        }
        
        if (isNaN(pricePerM2) || pricePerM2 <= 0) {
            alert('Cijena po m² mora biti pozitivan broj.');
            return;
        }

        let area = (width * height) / 10000;
        if (area < 1) area = 1;

        const price = area * pricePerM2;

        let color = null;
        let style = null;
        if (type === 'Komarnik') {
            color = document.getElementById('komarnikColor').value;
            style = document.getElementById('komarnikStyle').value;
        }

        const product = {
            id: Date.now().toString(),
            type,
            width,
            height,
            area,
            price,
            color,
            style,
            note: document.getElementById('productNote').value.trim()
        };

        const measurements = loadMeasurements();
        const m = measurements.find(meas => meas.id === currentMeasurementId);
        if (m) {
            m.products.push(product);
            saveMeasurements(measurements);
            showDetails(currentMeasurementId);
        }
    };

    document.querySelectorAll('.delete-product').forEach(btn => {
        btn.onclick = () => {
            const prodId = btn.dataset.id;
            const measurements = loadMeasurements();
            const m = measurements.find(meas => meas.id === currentMeasurementId);
            if (m) {
                m.products = m.products.filter(p => p.id !== prodId);
                saveMeasurements(measurements);
                showDetails(currentMeasurementId);
            }
        };
    });
};

/* 1. Existing filter handling */
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        if (filter === 'Dashboard') {
            renderDashboard();
        } else {
            currentFilter = filter;
            renderMeasurements();
        }
    });
});

/* 2. Dashboard rendering */
function renderDashboard() {
    const container = document.getElementById('measurementsContainer');
    container.innerHTML = `
        <div class="dashboard">
            <h2>Dashboard</h2>
            <div class="time-filter">
                <label>Period:
                    <select id="timeFilter">
                        <option value="All">Oduvjek</option>
                        <option value="Month">Ovaj mjesec</option>
                        <option value="Year">Ove godine</option>
                    </select>
                </label>
            </div>
            <div id="overviewStats" class="stats-section"></div>
            <div id="productBreakdown" class="stats-section"></div>
        </div>
    `;
    document.getElementById('timeFilter').addEventListener('change', updateDashboard);
    updateDashboard();
}

/* 3. Dashboard update logic */
function updateDashboard() {
    const filter = document.getElementById('timeFilter').value;
    const now = new Date();
    const measurements = loadMeasurements().filter(m => {
        const d = new Date(m.createdAt);
        if (filter === 'Month') {
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        } else if (filter === 'Year') {
            return d.getFullYear() === now.getFullYear();
        }
        return true; // All
    });

    // Overview calculations
    const totalMeasurements = measurements.length;
    const paidMeasurementsList = measurements.filter(m => m.status === 'Placeno');
    const paidCount = paidMeasurementsList.length;
    const totalRevenue = paidMeasurementsList.reduce((sum, m) => sum + m.products.reduce((s, p) => s + p.price, 0), 0);
    const totalCost = paidMeasurementsList.reduce((sum, m) => sum + m.products.reduce((s, p) => s + p.area * 25, 0), 0);
    const profit = totalRevenue - totalCost;
    const profitPct = totalRevenue ? ((profit / totalRevenue) * 100).toFixed(2) : 0;

    document.getElementById('overviewStats').innerHTML = `
        <h3>Overview</h3>
        <ul>
            <li>Broj mjerenja: ${totalMeasurements}</li>
            <li>Broj placenih mjerenja: ${paidCount}</li>
            <li>Ukupna zarada: €${totalRevenue.toFixed(2)}</li>
            <li>Trosak materijala: €${totalCost.toFixed(2)}</li>
            <li>Profit: €${profit.toFixed(2)} (${profitPct}%)</li>
        </ul>
    `;

    // Product breakdown
    const types = ['Komarnik', 'Skrin zavjesa', 'Venecijaner', 'Zebra zavjesa'];
    const breakdown = types.map(type => {
        const products = measurements.flatMap(m => m.products.filter(p => p.type === type));
        const count = products.length;
        const area = products.reduce((s, p) => s + p.area, 0);
        const revenue = products.reduce((s, p) => s + p.price, 0);
        return {type, count, area, revenue};
    });

    const rows = breakdown.map(b => `
        <tr>
            <td>${b.type}</td>
            <td>${b.count}</td>
            <td>${b.area.toFixed(2)} m²</td>
            <td>€${b.revenue.toFixed(2)}</td>
        </tr>
    `).join('');

    document.getElementById('productBreakdown').innerHTML = `
        <h3>Product breakdown</h3>
        <table border="1" cellpadding="4" cellspacing="0">
            <tr><th>Type</th><th>Count</th><th>Total Area</th><th>Total Revenue</th></tr>
            ${rows}
        </table>
    `;
}

newMeasurementBtn.addEventListener('click', () => {
    modal.classList.add('show');
    document.getElementById('customerName').value = '';
    document.getElementById('phoneNumber').value = '';
    document.getElementById('projectName').value = '';
});

startBtn.addEventListener('click', () => {
    const customerName = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('phoneNumber').value.trim();
    const projectName = document.getElementById('projectName').value.trim();

    if (!customerName || !phone || !projectName) {
        alert('Sva polja su obavezna.');
        return;
    }

    const measurement = {
        id: Date.now().toString(),
        customerName,
        phone,
        projectName,
        createdAt: new Date().toISOString(),
        status: "Mjereno",
        products: []
    };

    const measurements = loadMeasurements();
    measurements.push(measurement);
    saveMeasurements(measurements);
    modal.classList.remove('show');
    renderMeasurements();
});

cancelBtn.addEventListener('click', () => {
    modal.classList.remove('show');
});

renderMeasurements();


});