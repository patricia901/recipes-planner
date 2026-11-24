const API_URL = 'http://localhost:5000/api';

let currentUser = null;
try {
    currentUser = JSON.parse(localStorage.getItem('user'));
} catch {
    currentUser = null;
}

const UNIT_LABELS = { g: 'g', ml: 'ml', pcs: 'buc', tbsp: 'lingură', tsp: 'linguriță', cup: 'cană' };
const MEAL_LABELS = { breakfast: 'Mic dejun', lunch: 'Prânz', snack: 'Gustare', dinner: 'Cină' };

const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const userInfo = document.getElementById('user-info');
const welcomeUser = document.getElementById('welcome-user');
const authMsg = document.getElementById('auth-msg');

let ingredientsCatalog = [];

// ---------- Utilitare ----------

async function api(path, options = {}) {
    let res;
    try {
        res = await fetch(`${API_URL}${path}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
    } catch {
        throw new Error('Serverul nu răspunde. Pornește-l cu: node server.js');
    }

    let data = null;
    try {
        data = await res.json();
    } catch {
        data = null;
    }

    if (!res.ok) {
        throw new Error((data && data.error) || 'Eroare de server.');
    }
    return data;
}

function esc(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function unitLabel(unit) {
    return UNIT_LABELS[unit] || unit;
}

function showAuthMessage(text, isError = true) {
    authMsg.style.color = isError ? '#dc2626' : '#2e7d32';
    authMsg.textContent = text;
}

// ---------- Pornire ----------

document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        showApp();
    }
});

// ---------- Autentificare ----------

document.getElementById('tab-login').addEventListener('click', () => {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    authMsg.textContent = '';
});

document.getElementById('tab-register').addEventListener('click', () => {
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    authMsg.textContent = '';
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const data = await api('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        currentUser = data.user;
        localStorage.setItem('user', JSON.stringify(currentUser));
        authMsg.textContent = '';
        showApp();
    } catch (err) {
        showAuthMessage(err.message);
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const full_name = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;

    try {
        await api('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ full_name, email, password })
        });
        document.getElementById('tab-login').click();
        showAuthMessage('Cont creat! Te poți autentifica acum.', false);
        document.getElementById('register-form').reset();
    } catch (err) {
        showAuthMessage(err.message);
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('user');
    currentUser = null;
    authSection.classList.remove('hidden');
    appSection.classList.add('hidden');
    userInfo.classList.add('hidden');
    authMsg.textContent = '';
});

// ---------- Navigare ----------

document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.view).classList.remove('hidden');
    });
});

function showApp() {
    authSection.classList.add('hidden');
    appSection.classList.remove('hidden');
    userInfo.classList.remove('hidden');
    welcomeUser.textContent = `Salut, ${currentUser.full_name || currentUser.email}!`;

    document.getElementById('plan-date').value = new Date().toISOString().split('T')[0];

    loadIngredientsCatalog();
    loadFridge();
    loadAllRecipes();
    loadMealPlan();
    loadShoppingList();
}

// ---------- Frigider ----------

async function loadIngredientsCatalog() {
    try {
        ingredientsCatalog = await api('/fridge/ingredients');
        const select = document.getElementById('ingredient-select');
        select.innerHTML = ingredientsCatalog
            .map((i) => `<option value="${i.id}">${esc(i.name)} (${esc(i.category)})</option>`)
            .join('');
        syncDefaultUnit();
    } catch (err) {
        console.error(err);
    }
}

// Când alegi un ingredient, unitatea lui implicită se selectează automat
function syncDefaultUnit() {
    const id = Number(document.getElementById('ingredient-select').value);
    const ingredient = ingredientsCatalog.find((i) => i.id === id);
    if (ingredient) {
        document.getElementById('fridge-unit').value = ingredient.default_unit;
    }
}

document.getElementById('ingredient-select').addEventListener('change', syncDefaultUnit);

async function loadFridge() {
    const list = document.getElementById('fridge-list');
    try {
        const items = await api(`/fridge/${currentUser.id}`);
        list.innerHTML = items.length === 0
            ? '<li>Frigiderul este gol. Adaugă ingrediente mai sus!</li>'
            : items.map((item) => `
                <li>
                    <span><strong>${esc(item.ingredient_name)}</strong> — ${esc(item.quantity)} ${esc(unitLabel(item.unit))}</span>
                    <button class="btn-danger" onclick="deleteFridgeItem(${item.ingredient_id})">Șterge</button>
                </li>
            `).join('');
    } catch (err) {
        list.innerHTML = `<li>${esc(err.message)}</li>`;
    }
}

document.getElementById('add-fridge-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const ingredient_id = document.getElementById('ingredient-select').value;
    const quantity = document.getElementById('fridge-qty').value;
    const unit = document.getElementById('fridge-unit').value;

    try {
        await api('/fridge', {
            method: 'POST',
            body: JSON.stringify({ user_id: currentUser.id, ingredient_id, quantity, unit })
        });
        document.getElementById('fridge-qty').value = '';
        loadFridge();
    } catch (err) {
        alert(err.message);
    }
});

async function deleteFridgeItem(ingredientId) {
    try {
        await api(`/fridge/${currentUser.id}/${ingredientId}`, { method: 'DELETE' });
        loadFridge();
    } catch (err) {
        alert(err.message);
    }
}

// ---------- Rețete ----------

async function loadAllRecipes() {
    try {
        const recipes = await api('/recipes');
        renderRecipes(recipes);

        const planSelect = document.getElementById('plan-recipe-select');
        planSelect.innerHTML = recipes
            .map((r) => `<option value="${r.id}">${esc(r.title)}</option>`)
            .join('');
    } catch (err) {
        document.getElementById('recipes-grid').innerHTML = `<p>${esc(err.message)}</p>`;
    }
}

document.getElementById('btn-all-recipes').addEventListener('click', loadAllRecipes);

document.getElementById('btn-match-recipes').addEventListener('click', async () => {
    try {
        const recipes = await api(`/recipes/match/${currentUser.id}`);
        renderRecipes(recipes, true);
    } catch (err) {
        alert(err.message);
    }
});

function renderRecipes(recipes, isMatch = false) {
    const grid = document.getElementById('recipes-grid');
    if (!recipes.length) {
        grid.innerHTML = '<p>Nu s-au găsit rețete.</p>';
        return;
    }
    grid.innerHTML = recipes.map((r) => `
        <div class="recipe-card">
            ${isMatch && r.match_percentage !== undefined
                ? `<span class="badge">Potrivire: ${Math.round(r.match_percentage)}% (${r.available_ingredients}/${r.total_ingredients} ingrediente)</span>`
                : ''}
            <h3>${esc(r.title)}</h3>
            <p>${esc(r.description)}</p>
            <p style="margin-top:8px; font-size:0.85rem; color:#6b7280;">
                ⏱ ${esc(r.prep_time_minutes)} min • 🍽 ${esc(r.servings)} porții
            </p>
        </div>
    `).join('');
}

// ---------- Planificator ----------

document.getElementById('add-plan-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const recipe_id = document.getElementById('plan-recipe-select').value;
    const date = document.getElementById('plan-date').value;
    const meal_type = document.getElementById('plan-meal-type').value;
    const servings = document.getElementById('plan-servings').value;

    try {
        await api('/planner', {
            method: 'POST',
            body: JSON.stringify({ user_id: currentUser.id, recipe_id, date, meal_type, servings })
        });
        loadMealPlan();
    } catch (err) {
        alert(err.message);
    }
});

async function loadMealPlan() {
    const list = document.getElementById('meal-plan-list');
    try {
        const plans = await api(`/planner/${currentUser.id}`);
        list.innerHTML = plans.length === 0
            ? '<li>Nicio masă planificată încă.</li>'
            : plans.map((p) => `
                <li>
                    <span><strong>${esc(String(p.date).split('T')[0])}</strong>
                    (${esc(MEAL_LABELS[p.meal_type] || p.meal_type)}) — ${esc(p.recipe_title)} (${esc(p.servings)} porții)</span>
                </li>
            `).join('');
    } catch (err) {
        list.innerHTML = `<li>${esc(err.message)}</li>`;
    }
}

// ---------- Lista de cumpărături ----------

document.getElementById('btn-generate-shopping').addEventListener('click', async () => {
    try {
        const data = await api(`/planner/generate-shopping-list/${currentUser.id}`, { method: 'POST' });
        alert(data.message);
        loadShoppingList();
    } catch (err) {
        alert(err.message);
    }
});

async function loadShoppingList() {
    const list = document.getElementById('shopping-list');
    try {
        const items = await api(`/planner/shopping-list/${currentUser.id}`);
        list.innerHTML = items.length === 0
            ? '<li>Lista de cumpărături este goală.</li>'
            : items.map((item) => `
                <li>
                    <label class="${item.is_bought ? 'bought' : ''}" style="cursor:pointer;">
                        <input type="checkbox" ${item.is_bought ? 'checked' : ''}
                               onchange="toggleShoppingItem(${item.id}, this.checked)">
                        ${esc(item.ingredient_name)} — ${esc(item.quantity)} ${esc(unitLabel(item.unit))}
                    </label>
                </li>
            `).join('');
    } catch (err) {
        list.innerHTML = `<li>${esc(err.message)}</li>`;
    }
}

async function toggleShoppingItem(itemId, isBought) {
    try {
        await api(`/planner/shopping-list/${itemId}`, {
            method: 'PATCH',
            body: JSON.stringify({ is_bought: isBought })
        });
        loadShoppingList();
    } catch (err) {
        alert(err.message);
    }
}