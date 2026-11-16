const API_URL = 'http://localhost:5000/api';
let currentUser = JSON.parse(localStorage.getItem('user')) || null;

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const userInfo = document.getElementById('user-info');
const welcomeUser = document.getElementById('welcome-user');

document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        showApp();
    }
});

document.getElementById('tab-login').addEventListener('click', () => {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
});

document.getElementById('tab-register').addEventListener('click', () => {
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok) {
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        showApp();
    } else {
        document.getElementById('auth-msg').textContent = data.error || 'Eroare la autentificare.';
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    const data = await res.json();

    if (res.ok) {
        document.getElementById('auth-msg').style.color = '#2e7d32';
        document.getElementById('auth-msg').textContent = 'Cont creat! Te poți autentifica acum.';
        document.getElementById('tab-login').click();
    } else {
        document.getElementById('auth-msg').textContent = data.error || 'Eroare la înregistrare.';
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('user');
    currentUser = null;
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    userInfo.classList.add('hidden');
});

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.view).classList.remove('hidden');
    });
});

function showApp() {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    userInfo.classList.remove('hidden');
    welcomeUser.textContent = `Salut, ${currentUser.username}!`;

    loadIngredientsCatalog();
    loadFridge();
    loadAllRecipes();
    loadMealPlan();
    loadShoppingList();
}

async function loadIngredientsCatalog() {
    const res = await fetch(`${API_URL}/fridge/ingredients`);
    const items = await res.json();
    const select = document.getElementById('ingredient-select');
    select.innerHTML = items.map(i => `<option value="${i.id}">${i.name} (${i.category || 'general'})</option>`).join('');
}

async function loadFridge() {
    const res = await fetch(`${API_URL}/fridge/${currentUser.id}`);
    const items = await res.json();
    const list = document.getElementById('fridge-list');
    list.innerHTML = items.length === 0
        ? '<li>Frigiderul este gol. Adaugă ingrediente mai sus!</li>'
        : items.map(item => `
            <li>
                <span><strong>${item.name}</strong> — ${item.quantity} ${item.unit}</span>
                <button class="btn-danger" onclick="deleteFridgeItem(${item.id})">Șterge</button>
            </li>
        `).join('');
}

document.getElementById('add-fridge-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const ingredient_id = document.getElementById('ingredient-select').value;
    const quantity = document.getElementById('fridge-qty').value;
    const unit = document.getElementById('fridge-unit').value;

    await fetch(`${API_URL}/fridge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, ingredient_id, quantity, unit })
    });
    e.target.reset();
    loadFridge();
});

async function deleteFridgeItem(id) {
    await fetch(`${API_URL}/fridge/${id}`, { method: 'DELETE' });
    loadFridge();
}

async function loadAllRecipes() {
    const res = await fetch(`${API_URL}/recipes`);
    const recipes = await res.json();
    renderRecipes(recipes);

    const planSelect = document.getElementById('plan-recipe-select');
    planSelect.innerHTML = recipes.map(r => `<option value="${r.id}">${r.title}</option>`).join('');
}

document.getElementById('btn-all-recipes').addEventListener('click', loadAllRecipes);

document.getElementById('btn-match-recipes').addEventListener('click', async () => {
    const res = await fetch(`${API_URL}/recipes/match/${currentUser.id}`);
    const recipes = await res.json();
    renderRecipes(recipes, true);
});

function renderRecipes(recipes, isMatch = false) {
    const grid = document.getElementById('recipes-grid');
    if (!recipes.length) {
        grid.innerHTML = '<p>Nu s-au găsit rețete.</p>';
        return;
    }
    grid.innerHTML = recipes.map(r => `
        <div class="recipe-card">
            ${isMatch && r.match_percentage !== undefined ? `<span class="badge">Potrivire: ${Math.round(r.match_percentage)}%</span>` : ''}
            <h3>${r.title}</h3>
            <p>${r.description || ''}</p>
            <p style="margin-top:8px; font-size:0.85rem; color:#6b7280;">⏱ ${r.prep_time_minutes || 20} min • 🍽 ${r.servings || 2} porții</p>
        </div>
    `).join('');
}

document.getElementById('add-plan-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const recipe_id = document.getElementById('plan-recipe-select').value;
    const date = document.getElementById('plan-date').value;
    const meal_type = document.getElementById('plan-meal-type').value;
    const servings = document.getElementById('plan-servings').value;

    await fetch(`${API_URL}/planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, recipe_id, date, meal_type, servings })
    });
    loadMealPlan();
});

async function loadMealPlan() {
    const res = await fetch(`${API_URL}/planner/${currentUser.id}`);
    const plans = await res.json();
    const list = document.getElementById('meal-plan-list');
    list.innerHTML = plans.length === 0
        ? '<li>Nicio masă planificată încă.</li>'
        : plans.map(p => `
            <li>
                <span><strong>${p.date.split('T')[0]}</strong> (${p.meal_type}) — ${p.recipe_title} (${p.servings} porții)</span>
            </li>
        `).join('');
}

document.getElementById('btn-generate-shopping').addEventListener('click', async () => {
    const res = await fetch(`${API_URL}/planner/generate-shopping-list/${currentUser.id}`, { method: 'POST' });
    const data = await res.json();
    alert(data.message);
    loadShoppingList();
});

async function loadShoppingList() {
    const res = await fetch(`${API_URL}/planner/shopping-list/${currentUser.id}`);
    const items = await res.json();
    const list = document.getElementById('shopping-list');
    list.innerHTML = items.length === 0
        ? '<li>Lista de cumpărături este goală.</li>'
        : items.map(item => `
            <li>
                <label class="${item.is_bought ? 'bought' : ''}" style="cursor:pointer;">
                    <input type="checkbox" ${item.is_bought ? 'checked' : ''} onchange="toggleShoppingItem(${item.id}, this.checked)">
                    ${item.ingredient_name} — ${item.quantity} ${item.unit}
                </label>
            </li>
        `).join('');
}

async function toggleShoppingItem(itemId, isBought) {
    await fetch(`${API_URL}/planner/shopping-list/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_bought: isBought })
    });
    loadShoppingList();
}
