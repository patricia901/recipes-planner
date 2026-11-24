const fs = require('fs');

fs.writeFileSync('server.js', `const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'P@ti28122005',
    database: 'recipe_app_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Successfully connected to the MySQL database (recipe_app_db)!');
});

const authRoutes = require('./routes/auth')(db);
app.use('/api/auth', authRoutes);

const fridgeRoutes = require('./routes/fridge')(db);
app.use('/api/fridge', fridgeRoutes);

const recipeRoutes = require('./routes/recipes')(db);
app.use('/api/recipes', recipeRoutes);

const plannerRoutes = require('./routes/planner')(db);
app.use('/api/planner', plannerRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(\`Server is running on http://localhost:\${PORT}\`);
});
`);

fs.writeFileSync('public/index.html', `<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recipe & Meal Planner</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <div class="container nav-bar">
            <h1>🍳 Recipe & Meal Planner</h1>
            <div id="user-info" class="hidden">
                <span id="welcome-user"></span>
                <button id="logout-btn" class="btn-secondary">Deconectare</button>
            </div>
        </div>
    </header>

    <main class="container">
        <section id="auth-section" class="card auth-card">
            <div class="tabs">
                <button id="tab-login" class="tab active">Autentificare</button>
                <button id="tab-register" class="tab">Înregistrare</button>
            </div>

            <form id="login-form">
                <input type="email" id="login-email" placeholder="Email" required>
                <input type="password" id="login-password" placeholder="Parolă" required>
                <button type="submit" class="btn-primary">Intră în cont</button>
            </form>

            <form id="register-form" class="hidden">
                <input type="text" id="reg-username" placeholder="Nume utilizator" required>
                <input type="email" id="reg-email" placeholder="Email" required>
                <input type="password" id="reg-password" placeholder="Parolă" required>
                <button type="submit" class="btn-primary">Creează cont</button>
            </form>
            <p id="auth-msg" class="msg"></p>
        </section>

        <section id="app-section" class="hidden">
            <nav class="main-nav">
                <button class="nav-btn active" data-view="fridge-view">🧊 Frigiderul meu</button>
                <button class="nav-btn" data-view="recipes-view">📖 Rețete</button>
                <button class="nav-btn" data-view="planner-view">📅 Planificator & Cumpărături</button>
            </nav>

            <div id="fridge-view" class="view">
                <div class="card">
                    <h2>Adaugă ingredient în frigider</h2>
                    <form id="add-fridge-form" class="inline-form">
                        <select id="ingredient-select" required></select>
                        <input type="number" id="fridge-qty" step="0.1" min="0.1" placeholder="Cantitate" required>
                        <input type="text" id="fridge-unit" placeholder="Unitate (ex: g, buc, ml)" required>
                        <button type="submit" class="btn-primary">Adaugă</button>
                    </form>
                </div>

                <div class="card">
                    <h2>Ce am acum în frigider</h2>
                    <ul id="fridge-list" class="item-list"></ul>
                </div>
            </div>

            <div id="recipes-view" class="view hidden">
                <div class="card">
                    <div class="section-header">
                        <h2>Rețete disponibile</h2>
                        <div>
                            <button id="btn-all-recipes" class="btn-secondary">Toate rețetele</button>
                            <button id="btn-match-recipes" class="btn-primary">✨ Ce pot găti acum?</button>
                        </div>
                    </div>
                    <div id="recipes-grid" class="grid"></div>
                </div>
            </div>

            <div id="planner-view" class="view hidden">
                <div class="card">
                    <h2>Adaugă masă în plan</h2>
                    <form id="add-plan-form" class="inline-form">
                        <select id="plan-recipe-select" required></select>
                        <input type="date" id="plan-date" required>
                        <select id="plan-meal-type">
                            <option value="breakfast">Mic dejun</option>
                            <option value="lunch">Prânz</option>
                            <option value="snack">Gustare</option>
                            <option value="dinner">Cină</option>
                        </select>
                        <input type="number" id="plan-servings" min="1" value="2" placeholder="Porții" required>
                        <button type="submit" class="btn-primary">Planifică</button>
                    </form>
                </div>

                <div class="two-cols">
                    <div class="card">
                        <h2>Meniul planificat</h2>
                        <ul id="meal-plan-list" class="item-list"></ul>
                    </div>

                    <div class="card">
                        <div class="section-header">
                            <h2>Lista de cumpărături</h2>
                            <button id="btn-generate-shopping" class="btn-primary">Generează automat</button>
                        </div>
                        <ul id="shopping-list" class="item-list"></ul>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <script src="app.js"></script>
</body>
</html>
`);

fs.writeFileSync('public/style.css', `:root {
    --primary: #2e7d32;
    --primary-hover: #1b5e20;
    --bg: #f4f6f8;
    --card: #ffffff;
    --text: #1f2937;
    --muted: #6b7280;
    --border: #e5e7eb;
}

* { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', system-ui, sans-serif; }
body { background: var(--bg); color: var(--text); line-height: 1.5; }
.container { max-width: 1050px; margin: 0 auto; padding: 0 16px; }
.hidden { display: none !important; }

header { background: var(--primary); color: #fff; padding: 16px 0; margin-bottom: 24px; }
.nav-bar { display: flex; justify-content: space-between; align-items: center; }
.nav-bar h1 { font-size: 1.35rem; }
#user-info { display: flex; align-items: center; gap: 12px; }

.card { background: var(--card); border-radius: 10px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 6px rgba(0,0,0,0.06); }
.auth-card { max-width: 420px; margin: 40px auto; }
.tabs { display: flex; gap: 8px; margin-bottom: 16px; }
.tab { flex: 1; padding: 10px; border: 1px solid var(--border); background: #f9fafb; cursor: pointer; border-radius: 6px; font-weight: 600; }
.tab.active { background: var(--primary); color: #fff; border-color: var(--primary); }

form { display: flex; flex-direction: column; gap: 12px; }
.inline-form { flex-direction: row; flex-wrap: wrap; }
.inline-form input, .inline-form select { flex: 1; min-width: 140px; }
input, select { padding: 10px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 0.95rem; }

button { padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: 0.2s; }
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { background: var(--primary-hover); }
.btn-secondary { background: #e5e7eb; color: var(--text); }
.btn-danger { background: #dc2626; color: #fff; padding: 6px 10px; font-size: 0.85rem; }

.main-nav { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
.nav-btn { background: #fff; border: 1px solid var(--border); }
.nav-btn.active { background: var(--primary); color: #fff; border-color: var(--primary); }

.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.recipe-card { border: 1px solid var(--border); border-radius: 8px; padding: 16px; background: #fafafa; }
.recipe-card h3 { margin-bottom: 6px; color: var(--primary); }
.badge { display: inline-block; background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; margin-bottom: 8px; }

.two-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 768px) { .two-cols { grid-template-columns: 1fr; } }

.item-list { list-style: none; }
.item-list li { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
.bought { text-decoration: line-through; color: var(--muted); }
.msg { margin-top: 10px; color: #dc2626; font-size: 0.9rem; }
`);

fs.writeFileSync('public/app.js', `const API_URL = 'http://localhost:5000/api';
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

    const res = await fetch(\`\${API_URL}/auth/login\`, {
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

    const res = await fetch(\`\${API_URL}/auth/register\`, {
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
    welcomeUser.textContent = \`Salut, \${currentUser.username}!\`;

    loadIngredientsCatalog();
    loadFridge();
    loadAllRecipes();
    loadMealPlan();
    loadShoppingList();
}

async function loadIngredientsCatalog() {
    const res = await fetch(\`\${API_URL}/fridge/ingredients\`);
    const items = await res.json();
    const select = document.getElementById('ingredient-select');
    select.innerHTML = items.map(i => \`<option value="\${i.id}">\${i.name} (\${i.category || 'general'})</option>\`).join('');
}

async function loadFridge() {
    const res = await fetch(\`\${API_URL}/fridge/\${currentUser.id}\`);
    const items = await res.json();
    const list = document.getElementById('fridge-list');
    list.innerHTML = items.length === 0
        ? '<li>Frigiderul este gol. Adaugă ingrediente mai sus!</li>'
        : items.map(item => \`
            <li>
                <span><strong>\${item.name}</strong> — \${item.quantity} \${item.unit}</span>
                <button class="btn-danger" onclick="deleteFridgeItem(\${item.id})">Șterge</button>
            </li>
        \`).join('');
}

document.getElementById('add-fridge-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const ingredient_id = document.getElementById('ingredient-select').value;
    const quantity = document.getElementById('fridge-qty').value;
    const unit = document.getElementById('fridge-unit').value;

    await fetch(\`\${API_URL}/fridge\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, ingredient_id, quantity, unit })
    });
    e.target.reset();
    loadFridge();
});

async function deleteFridgeItem(id) {
    await fetch(\`\${API_URL}/fridge/\${id}\`, { method: 'DELETE' });
    loadFridge();
}

async function loadAllRecipes() {
    const res = await fetch(\`\${API_URL}/recipes\`);
    const recipes = await res.json();
    renderRecipes(recipes);

    const planSelect = document.getElementById('plan-recipe-select');
    planSelect.innerHTML = recipes.map(r => \`<option value="\${r.id}">\${r.title}</option>\`).join('');
}

document.getElementById('btn-all-recipes').addEventListener('click', loadAllRecipes);

document.getElementById('btn-match-recipes').addEventListener('click', async () => {
    const res = await fetch(\`\${API_URL}/recipes/match/\${currentUser.id}\`);
    const recipes = await res.json();
    renderRecipes(recipes, true);
});

function renderRecipes(recipes, isMatch = false) {
    const grid = document.getElementById('recipes-grid');
    if (!recipes.length) {
        grid.innerHTML = '<p>Nu s-au găsit rețete.</p>';
        return;
    }
    grid.innerHTML = recipes.map(r => \`
        <div class="recipe-card">
            \${isMatch && r.match_percentage !== undefined ? \`<span class="badge">Potrivire: \${Math.round(r.match_percentage)}%</span>\` : ''}
            <h3>\${r.title}</h3>
            <p>\${r.description || ''}</p>
            <p style="margin-top:8px; font-size:0.85rem; color:#6b7280;">⏱ \${r.prep_time_minutes || 20} min • 🍽 \${r.servings || 2} porții</p>
        </div>
    \`).join('');
}

document.getElementById('add-plan-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const recipe_id = document.getElementById('plan-recipe-select').value;
    const date = document.getElementById('plan-date').value;
    const meal_type = document.getElementById('plan-meal-type').value;
    const servings = document.getElementById('plan-servings').value;

    await fetch(\`\${API_URL}/planner\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id, recipe_id, date, meal_type, servings })
    });
    loadMealPlan();
});

async function loadMealPlan() {
    const res = await fetch(\`\${API_URL}/planner/\${currentUser.id}\`);
    const plans = await res.json();
    const list = document.getElementById('meal-plan-list');
    list.innerHTML = plans.length === 0
        ? '<li>Nicio masă planificată încă.</li>'
        : plans.map(p => \`
            <li>
                <span><strong>\${p.date.split('T')[0]}</strong> (\${p.meal_type}) — \${p.recipe_title} (\${p.servings} porții)</span>
            </li>
        \`).join('');
}

document.getElementById('btn-generate-shopping').addEventListener('click', async () => {
    const res = await fetch(\`\${API_URL}/planner/generate-shopping-list/\${currentUser.id}\`, { method: 'POST' });
    const data = await res.json();
    alert(data.message);
    loadShoppingList();
});

async function loadShoppingList() {
    const res = await fetch(\`\${API_URL}/planner/shopping-list/\${currentUser.id}\`);
    const items = await res.json();
    const list = document.getElementById('shopping-list');
    list.innerHTML = items.length === 0
        ? '<li>Lista de cumpărături este goală.</li>'
        : items.map(item => \`
            <li>
                <label class="\${item.is_bought ? 'bought' : ''}" style="cursor:pointer;">
                    <input type="checkbox" \${item.is_bought ? 'checked' : ''} onchange="toggleShoppingItem(\${item.id}, this.checked)">
                    \${item.ingredient_name} — \${item.quantity} \${item.unit}
                </label>
            </li>
        \`).join('');
}

async function toggleShoppingItem(itemId, isBought) {
    await fetch(\`\${API_URL}/planner/shopping-list/\${itemId}\`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_bought: isBought })
    });
    loadShoppingList();
}
`);

console.log('GATA! Toate fisierele au fost scrise cu succes.');