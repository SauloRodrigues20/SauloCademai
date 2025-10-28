/* ========================================
   SISTEMA DE GERENCIAMENTO FITNESS
   Controla contador de dias, alimentação e gráficos
======================================== */

// ========================================
// VARIÁVEIS GLOBAIS E CONFIGURAÇÃO
// ========================================
const STORAGE_KEYS = {
    dayCounter: 'fitness_day_counter',
    lastWorkout: 'fitness_last_workout',
    weeklyWorkouts: 'fitness_weekly_workouts',
    nutrition: 'fitness_nutrition',
    shoppingList: 'fitness_shopping_list',
    mealPlan: 'fitness_meal_plan'
};

const MOTIVATIONAL_QUOTES = [
    "A força ninja está dentro de você, Saulo! 🥷",
    "Cada treino é uma batalha vencida! ⚔️",
    "O caminho do guerreiro nunca tem fim! 🎌",
    "Discipline yourself like a true samurai! 🗾",
    "Saulo, your power level is increasing! ⚡",
    "Train hard, become legendary! 🏆",
    "The ninja way: never give up! 🌟",
    "Forge your body, strengthen your spirit! 🔥",
    "Every rep brings you closer to greatness! �",
    "Unlock your hidden potential, warrior! 🗝️"
];

// ========================================
// ELEMENTOS DO DOM
// ========================================
const elements = {
    dayCounter: document.getElementById('dayCounter'),
    workoutBtn: document.getElementById('workoutBtn'),
    lastWorkout: document.getElementById('lastWorkout'),
    motivationalQuote: document.getElementById('motivationalQuote'),
    saveNutritionBtn: document.getElementById('saveNutrition'),
    breakfast: document.getElementById('breakfast'),
    lunch: document.getElementById('lunch'),
    dinner: document.getElementById('dinner'),
    snacks: document.getElementById('snacks')
};

// ========================================
// UTILITÁRIOS DE DATA
// ========================================
function formatDate(date) {
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function isToday(dateString) {
    const today = new Date();
    const compareDate = new Date(dateString);
    return formatDate(today) === formatDate(compareDate);
}

function isSameWeek(date1, date2) {
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    return Math.abs(date1 - date2) < oneWeek;
}

// ========================================
// GERENCIAMENTO DO LOCALSTORAGE
// ========================================
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
    }
}

function loadFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('Erro ao carregar do localStorage:', error);
        return defaultValue;
    }
}

// ========================================
// SISTEMA DE CONTADOR DE DIAS
// ========================================
function updateDayCounter() {
    const counter = loadFromStorage(STORAGE_KEYS.dayCounter, 0);
    const lastWorkoutDate = loadFromStorage(STORAGE_KEYS.lastWorkout);
    
    // Verifica se precisa resetar o contador
    if (lastWorkoutDate) {
        const lastDate = new Date(lastWorkoutDate);
        const today = new Date();
        const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) {
            // Se passou mais de 1 dia, reseta o contador
            saveToStorage(STORAGE_KEYS.dayCounter, 0);
            elements.dayCounter.textContent = '0';
            updateAnimeStats(0);
            return;
        }
    }
    
    elements.dayCounter.textContent = counter;
    updateAnimeStats(counter);
}

function updateAnimeStats(dayCount) {
    // Atualiza nível baseado nos dias consecutivos
    const level = Math.floor(dayCount / 7) + 1;
    const xp = dayCount * 50;
    const energyPercent = Math.min((dayCount % 7) * 14.3, 100);
    
    // Atualiza elementos do hero
    const heroLevel = document.getElementById('heroLevel');
    const heroStreak = document.getElementById('heroStreak');
    const heroXP = document.getElementById('heroXP');
    
    if (heroLevel) heroLevel.textContent = `Nível ${level}`;
    if (heroStreak) heroStreak.textContent = dayCount;
    if (heroXP) heroXP.textContent = `${xp} XP`;
    
    // Atualiza power level na seção principal
    const powerLevel = document.getElementById('powerLevel');
    if (powerLevel) powerLevel.textContent = level;
    
    // Atualiza barra de energia
    const energyFill = document.getElementById('energyFill');
    const energyPercent_elem = document.getElementById('energyPercent');
    
    if (energyFill) {
        energyFill.style.width = `${energyPercent}%`;
    }
    if (energyPercent_elem) {
        energyPercent_elem.textContent = Math.round(energyPercent);
    }
}

function updateLastWorkoutDisplay() {
    const lastWorkoutDate = loadFromStorage(STORAGE_KEYS.lastWorkout);
    
    if (lastWorkoutDate) {
        const lastDate = new Date(lastWorkoutDate);
        elements.lastWorkout.textContent = `Última batalha: ${formatDate(lastDate)}`;
        
        // Verifica se já treinou hoje
        if (isToday(lastWorkoutDate)) {
            const btnText = elements.workoutBtn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = 'Missão Cumprida, Ninja! 🥷';
            }
            elements.workoutBtn.classList.add('completed');
            elements.workoutBtn.disabled = true;
        }
    } else {
        elements.lastWorkout.textContent = 'Primeira missão awaits...';
    }
}

function markWorkout() {
    const today = new Date();
    const lastWorkoutDate = loadFromStorage(STORAGE_KEYS.lastWorkout);
    
    // Verifica se já treinou hoje
    if (lastWorkoutDate && isToday(lastWorkoutDate)) {
        showNotification('Você já treinou hoje! 💪', 'info');
        return;
    }
    
    // Atualiza contador
    let counter = loadFromStorage(STORAGE_KEYS.dayCounter, 0);
    
    // Se treinou ontem, incrementa. Se não, reseta para 1
    if (lastWorkoutDate) {
        const lastDate = new Date(lastWorkoutDate);
        const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
            counter++;
        } else {
            counter = 1;
        }
    } else {
        counter = 1;
    }
    
    // Salva os dados
    saveToStorage(STORAGE_KEYS.dayCounter, counter);
    saveToStorage(STORAGE_KEYS.lastWorkout, today.toISOString());
    
    // Atualiza gráfico semanal
    updateWeeklyChart();
    
    // Atualiza interface
    updateDayCounter();
    updateLastWorkoutDisplay();
    
    // Exibe notificação de sucesso estilo anime
    const level = Math.floor(counter / 7) + 1;
    const xpGained = 50;
    showNotification(`🥷 LEVEL UP! ${counter} dias | +${xpGained} XP | Nível ${level}! ⚡`, 'success');
    
    // Adiciona animação de celebração
    celebrateWorkout();
}

// ========================================
// SISTEMA DE GRÁFICO SEMANAL
// ========================================
function updateWeeklyChart() {
    const today = new Date();
    const weeklyData = loadFromStorage(STORAGE_KEYS.weeklyWorkouts, {});
    
    // Adiciona treino de hoje
    const todayKey = formatDate(today);
    weeklyData[todayKey] = true;
    
    // Remove dados antigos (mais de 7 dias)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    Object.keys(weeklyData).forEach(dateKey => {
        const date = new Date(dateKey.split('/').reverse().join('-'));
        if (date < oneWeekAgo) {
            delete weeklyData[dateKey];
        }
    });
    
    saveToStorage(STORAGE_KEYS.weeklyWorkouts, weeklyData);
    renderWeeklyChart();
}

function renderWeeklyChart() {
    const weeklyData = loadFromStorage(STORAGE_KEYS.weeklyWorkouts, {});
    const today = new Date();
    let workoutCount = 0;
    
    // Renderiza barras para os últimos 7 dias
    // i = 0 representa domingo, i = 1 segunda, etc.
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        // Calcula a data baseada no dia da semana atual
        const todayDayOfWeek = today.getDay(); // 0 = domingo, 1 = segunda, etc.
        const daysBack = (todayDayOfWeek - i + 7) % 7;
        date.setDate(today.getDate() - daysBack);
        const dateKey = formatDate(date);
        
        const bar = document.getElementById(`bar-${i}`);
        if (weeklyData[dateKey]) {
            bar.style.height = '100%';
            bar.classList.add('active');
            workoutCount++;
        } else {
            bar.style.height = '30%';
            bar.classList.remove('active');
        }
    }
    
    // Atualiza progresso semanal
    updateWeeklyProgress(workoutCount);
}

function updateWeeklyProgress(workoutCount) {
    const percentage = Math.round((workoutCount / 7) * 100);
    const circumference = 2 * Math.PI * 25; // raio = 25
    const offset = circumference - (percentage / 100) * circumference;
    
    // Atualiza círculo de progresso
    const progressCircle = document.getElementById('weekProgress');
    if (progressCircle) {
        progressCircle.style.strokeDashoffset = offset;
    }
    
    // Atualiza texto de porcentagem
    const percentageText = document.getElementById('weekPercentage');
    if (percentageText) {
        percentageText.textContent = `${percentage}%`;
    }
    
    // Atualiza meta semanal
    const weekGoal = document.getElementById('weekGoal');
    if (weekGoal) {
        weekGoal.textContent = `${workoutCount}/7`;
    }
}

// ========================================
// SISTEMA DE ALIMENTAÇÃO
// ========================================
function saveNutrition() {
    const nutritionData = {
        date: formatDate(new Date()),
        breakfast: elements.breakfast.value.trim(),
        lunch: elements.lunch.value.trim(),
        dinner: elements.dinner.value.trim(),
        snacks: elements.snacks.value.trim(),
        timestamp: new Date().toISOString()
    };
    
    // Salva no localStorage
    const allNutritionData = loadFromStorage(STORAGE_KEYS.nutrition, {});
    allNutritionData[nutritionData.date] = nutritionData;
    saveToStorage(STORAGE_KEYS.nutrition, allNutritionData);
    
    // Exibe notificação
    showNotification('Alimentação salva com sucesso! 🍽️', 'success');
    
    // Adiciona efeito visual no botão
    const btn = elements.saveNutritionBtn;
    btn.style.transform = 'scale(0.95)';
    setTimeout(() => {
        btn.style.transform = 'scale(1)';
    }, 150);
}

function loadTodayNutrition() {
    const today = formatDate(new Date());
    const allNutritionData = loadFromStorage(STORAGE_KEYS.nutrition, {});
    const todayData = allNutritionData[today];
    
    if (todayData) {
        elements.breakfast.value = todayData.breakfast || '';
        elements.lunch.value = todayData.lunch || '';
        elements.dinner.value = todayData.dinner || '';
        elements.snacks.value = todayData.snacks || '';
    }
    
    // Atualiza contadores
    updateCharCounts();
    updateMealStats();
}

function updateCharCounts() {
    const inputs = [
        { element: elements.breakfast, counterId: 'breakfast-count' },
        { element: elements.lunch, counterId: 'lunch-count' },
        { element: elements.dinner, counterId: 'dinner-count' },
        { element: elements.snacks, counterId: 'snacks-count' }
    ];
    
    inputs.forEach(({ element, counterId }) => {
        const count = element.value.length;
        const counter = document.getElementById(counterId);
        if (counter) {
            counter.textContent = `${count}/200`;
            
            // Adiciona classes de aviso
            counter.classList.remove('warning', 'danger');
            if (count > 150) {
                counter.classList.add('warning');
            }
            if (count > 180) {
                counter.classList.add('danger');
            }
        }
    });
}

function updateMealStats() {
    // Conta quantas refeições foram preenchidas
    const meals = [elements.breakfast, elements.lunch, elements.dinner, elements.snacks];
    const filledMeals = meals.filter(meal => meal.value.trim().length > 0).length;
    
    // Atualiza contador de refeições
    const mealsCount = document.getElementById('mealsCount');
    if (mealsCount) {
        mealsCount.textContent = `${filledMeals}/4`;
    }
    
    // Simula contagem de calorias (baseado no número de caracteres)
    const totalChars = meals.reduce((sum, meal) => sum + meal.value.length, 0);
    const estimatedCalories = Math.round(totalChars * 3.5); // Estimativa simples
    
    const caloriesCount = document.getElementById('caloriesCount');
    if (caloriesCount) {
        caloriesCount.textContent = estimatedCalories;
    }
}

// ========================================
// SISTEMA DE NOTIFICAÇÕES
// ========================================
function showNotification(message, type = 'info') {
    // Remove notificação anterior se existir
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos da notificação
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        color: 'white',
        fontWeight: '600',
        fontSize: '0.9rem',
        zIndex: '1000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
    });
    
    // Cores baseadas no tipo
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Adiciona ao DOM
    document.body.appendChild(notification);
    
    // Animação de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// ========================================
// EFEITOS VISUAIS E ANIMAÇÕES
// ========================================
function celebrateWorkout() {
    // Animação no contador estilo anime
    elements.dayCounter.style.transform = 'scale(1.3)';
    elements.dayCounter.style.filter = 'drop-shadow(0 0 20px #ff3b5c)';
    
    setTimeout(() => {
        elements.dayCounter.style.transform = 'scale(1)';
        elements.dayCounter.style.filter = 'drop-shadow(0 0 20px rgba(255, 59, 92, 0.3))';
    }, 600);
    
    // Efeito especial ninja
    createNinjaEffect();
    createConfetti();
}

function createNinjaEffect() {
    // Cria efeito de poder ninja
    const ninjaEffects = ['⚡', '🌟', '💥', '✨', '🔥'];
    
    for (let i = 0; i < 8; i++) {
        const effect = document.createElement('div');
        effect.textContent = ninjaEffects[Math.floor(Math.random() * ninjaEffects.length)];
        effect.style.cssText = `
            position: fixed;
            font-size: 2rem;
            pointer-events: none;
            z-index: 1000;
            left: ${Math.random() * 100}vw;
            top: ${Math.random() * 100}vh;
            animation: ninjaBlast 2s ease-out forwards;
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode) {
                effect.remove();
            }
        }, 2000);
    }
}

// Adiciona animação ninja ao CSS dinamicamente
const ninjaStyle = document.createElement('style');
ninjaStyle.textContent = `
    @keyframes ninjaBlast {
        0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
        }
        50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 1;
        }
        100% {
            transform: scale(0.5) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(ninjaStyle);

function createConfetti() {
    const animeColors = ['#ff3b5c', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ff6b8a'];
    const shapes = ['●', '★', '◆', '▲', '♦'];
    
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = animeColors[Math.floor(Math.random() * animeColors.length)];
        
        confetti.textContent = shape;
        confetti.style.cssText = `
            position: fixed;
            font-size: ${Math.random() * 15 + 10}px;
            color: ${color};
            left: ${Math.random() * 100}vw;
            top: -20px;
            pointer-events: none;
            z-index: 1000;
            animation: anime-confetti-fall 4s linear forwards;
            text-shadow: 0 0 10px ${color};
        `;
        
        document.body.appendChild(confetti);
        
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, 4000);
    }
}

// Adiciona CSS para animações anime
const animeAnimationStyle = document.createElement('style');
animeAnimationStyle.textContent = `
    @keyframes anime-confetti-fall {
        0% {
            transform: translateY(-20px) rotate(0deg) scale(0);
            opacity: 1;
        }
        10% {
            transform: translateY(0px) rotate(36deg) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg) scale(0.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animeAnimationStyle);

// ========================================
// FRASES MOTIVACIONAIS
// ========================================
function updateMotivationalQuote() {
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    elements.motivationalQuote.textContent = randomQuote;
}

// ========================================
// FUNÇÃO PARA RESETAR/CORRIGIR DADOS
// ========================================
function resetWeeklyData() {
    // Limpa dados antigos do gráfico semanal
    const weeklyData = loadFromStorage(STORAGE_KEYS.weeklyWorkouts, {});
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    // Remove entradas mais antigas que 7 dias
    Object.keys(weeklyData).forEach(dateKey => {
        const [day, month, year] = dateKey.split('/');
        const date = new Date(year, month - 1, day);
        if (date < sevenDaysAgo) {
            delete weeklyData[dateKey];
        }
    });
    
    saveToStorage(STORAGE_KEYS.weeklyWorkouts, weeklyData);
}

// ========================================
// SISTEMA DE ABAS
// ========================================
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// ========================================
// SISTEMA DE LISTA DE COMPRAS
// ========================================
function initShoppingList() {
    const categories = ['proteins', 'carbs', 'vegetables', 'fats', 'dairy', 'others'];
    
    categories.forEach(category => {
        const addBtn = document.querySelector(`[data-category="${category}"]`);
        const input = document.getElementById(`${category}-input`);
        const priceInput = document.getElementById(`${category}-price`);
        
        if (addBtn && input && priceInput) {
            addBtn.addEventListener('click', () => addShoppingItem(category, input, priceInput));
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addShoppingItem(category, input, priceInput);
                }
            });
        }
    });
    
    // Event listeners para outros botões
    const clearBtn = document.getElementById('clearCompleted');
    const saveBtn = document.getElementById('saveShoppingList');
    const exportBtn = document.getElementById('exportList');
    
    if (clearBtn) clearBtn.addEventListener('click', clearCompletedItems);
    if (saveBtn) saveBtn.addEventListener('click', saveShoppingList);
    if (exportBtn) exportBtn.addEventListener('click', exportShoppingList);
    
    loadShoppingList();
}

function addShoppingItem(category, inputElement, priceElement) {
    const itemName = inputElement.value.trim();
    const itemPrice = parseFloat(priceElement.value) || 0;
    
    if (!itemName) return;
    
    const shoppingData = loadFromStorage(STORAGE_KEYS.shoppingList, {});
    if (!shoppingData[category]) shoppingData[category] = [];
    
    const newItem = {
        id: Date.now(),
        name: itemName,
        price: itemPrice,
        completed: false
    };
    
    shoppingData[category].push(newItem);
    saveToStorage(STORAGE_KEYS.shoppingList, shoppingData);
    
    inputElement.value = '';
    priceElement.value = '';
    
    renderShoppingCategory(category);
    updateShoppingStats();
    
    showNotification(`${itemName} adicionado à lista! 🛒`, 'success');
}

function renderShoppingCategory(category) {
    const shoppingData = loadFromStorage(STORAGE_KEYS.shoppingList, {});
    const categoryData = shoppingData[category] || [];
    const listElement = document.getElementById(`${category}-list`);
    const countElement = document.getElementById(`${category}-count`);
    
    if (!listElement || !countElement) return;
    
    listElement.innerHTML = '';
    countElement.textContent = categoryData.length;
    
    categoryData.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `shopping-item ${item.completed ? 'completed' : ''}`;
        itemElement.innerHTML = `
            <div class="item-info">
                <input type="checkbox" class="item-checkbox" ${item.completed ? 'checked' : ''} 
                       onchange="toggleShoppingItem('${category}', ${item.id})">
                <span class="item-name">${item.name}</span>
            </div>
            <span class="item-price">R$ ${item.price.toFixed(2)}</span>
            <button class="delete-item" onclick="deleteShoppingItem('${category}', ${item.id})">🗑️</button>
        `;
        listElement.appendChild(itemElement);
    });
}

function toggleShoppingItem(category, itemId) {
    const shoppingData = loadFromStorage(STORAGE_KEYS.shoppingList, {});
    const item = shoppingData[category]?.find(item => item.id === itemId);
    
    if (item) {
        item.completed = !item.completed;
        saveToStorage(STORAGE_KEYS.shoppingList, shoppingData);
        renderShoppingCategory(category);
        updateShoppingStats();
    }
}

function deleteShoppingItem(category, itemId) {
    const shoppingData = loadFromStorage(STORAGE_KEYS.shoppingList, {});
    if (shoppingData[category]) {
        shoppingData[category] = shoppingData[category].filter(item => item.id !== itemId);
        saveToStorage(STORAGE_KEYS.shoppingList, shoppingData);
        renderShoppingCategory(category);
        updateShoppingStats();
        showNotification('Item removido da lista! 🗑️', 'info');
    }
}

function loadShoppingList() {
    const categories = ['proteins', 'carbs', 'vegetables', 'fats', 'dairy', 'others'];
    categories.forEach(category => renderShoppingCategory(category));
    updateShoppingStats();
}

function updateShoppingStats() {
    const shoppingData = loadFromStorage(STORAGE_KEYS.shoppingList, {});
    let totalItems = 0;
    let completedItems = 0;
    let estimatedCost = 0;
    
    Object.values(shoppingData).forEach(categoryItems => {
        categoryItems.forEach(item => {
            totalItems++;
            if (item.completed) completedItems++;
            estimatedCost += item.price;
        });
    });
    
    const totalElement = document.getElementById('totalItems');
    const completedElement = document.getElementById('completedItems');
    const costElement = document.getElementById('estimatedCost');
    
    if (totalElement) totalElement.textContent = totalItems;
    if (completedElement) completedElement.textContent = completedItems;
    if (costElement) costElement.textContent = `R$ ${estimatedCost.toFixed(2)}`;
}

function clearCompletedItems() {
    const shoppingData = loadFromStorage(STORAGE_KEYS.shoppingList, {});
    
    Object.keys(shoppingData).forEach(category => {
        shoppingData[category] = shoppingData[category].filter(item => !item.completed);
    });
    
    saveToStorage(STORAGE_KEYS.shoppingList, shoppingData);
    loadShoppingList();
    showNotification('Itens comprados removidos! 🧹', 'success');
}

function saveShoppingList() {
    showNotification('Lista de compras salva! 💾', 'success');
}

function exportShoppingList() {
    const shoppingData = loadFromStorage(STORAGE_KEYS.shoppingList, {});
    let exportText = '🛒 LISTA DE COMPRAS SAUDÁVEIS\n';
    exportText += '=====================================\n\n';
    
    const categoryNames = {
        proteins: '🥩 PROTEÍNAS',
        carbs: '🍞 CARBOIDRATOS',
        vegetables: '🥬 VEGETAIS & FRUTAS',
        fats: '🥑 GORDURAS SAUDÁVEIS',
        dairy: '🥛 LATICÍNIOS',
        others: '🏪 OUTROS'
    };
    
    Object.entries(shoppingData).forEach(([category, items]) => {
        if (items.length > 0) {
            exportText += `${categoryNames[category]}\n`;
            exportText += '─────────────────────────\n';
            items.forEach(item => {
                const status = item.completed ? '✅' : '☐';
                exportText += `${status} ${item.name} - R$ ${item.price.toFixed(2)}\n`;
            });
            exportText += '\n';
        }
    });
    
    // Copia para clipboard
    navigator.clipboard.writeText(exportText).then(() => {
        showNotification('Lista copiada para área de transferência! 📋', 'success');
    }).catch(() => {
        showNotification('Erro ao copiar lista 😕', 'error');
    });
}

// ========================================
// SISTEMA DE PLANEJAMENTO SEMANAL
// ========================================
function initMealPlan() {
    const savePlanBtn = document.getElementById('saveMealPlan');
    const generateBtn = document.getElementById('generateShoppingFromPlan');
    
    if (savePlanBtn) savePlanBtn.addEventListener('click', saveMealPlan);
    if (generateBtn) generateBtn.addEventListener('click', generateShoppingFromPlan);
    
    loadMealPlan();
}

function saveMealPlan() {
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const meals = ['breakfast', 'lunch', 'dinner'];
    const planData = {};
    
    days.forEach(day => {
        planData[day] = {};
        meals.forEach(meal => {
            const element = document.getElementById(`${day}-${meal}`);
            if (element) {
                planData[day][meal] = element.value.trim();
            }
        });
    });
    
    saveToStorage(STORAGE_KEYS.mealPlan, planData);
    showNotification('Planejamento semanal salvo! 📅', 'success');
}

function loadMealPlan() {
    const planData = loadFromStorage(STORAGE_KEYS.mealPlan, {});
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const meals = ['breakfast', 'lunch', 'dinner'];
    
    days.forEach(day => {
        meals.forEach(meal => {
            const element = document.getElementById(`${day}-${meal}`);
            if (element && planData[day] && planData[day][meal]) {
                element.value = planData[day][meal];
            }
        });
    });
}

function generateShoppingFromPlan() {
    const planData = loadFromStorage(STORAGE_KEYS.mealPlan, {});
    const commonIngredients = {
        'frango': { category: 'proteins', price: 15.00 },
        'ovos': { category: 'proteins', price: 8.00 },
        'peixe': { category: 'proteins', price: 20.00 },
        'arroz': { category: 'carbs', price: 5.00 },
        'aveia': { category: 'carbs', price: 7.00 },
        'batata': { category: 'carbs', price: 4.00 },
        'brócolis': { category: 'vegetables', price: 6.00 },
        'banana': { category: 'vegetables', price: 5.00 },
        'maçã': { category: 'vegetables', price: 7.00 },
        'abacate': { category: 'fats', price: 8.00 },
        'azeite': { category: 'fats', price: 12.00 },
        'leite': { category: 'dairy', price: 6.00 },
        'iogurte': { category: 'dairy', price: 8.00 }
    };
    
    const foundIngredients = new Set();
    
    // Analisa o plano para encontrar ingredientes
    Object.values(planData).forEach(dayPlan => {
        Object.values(dayPlan).forEach(meal => {
            const mealText = meal.toLowerCase();
            Object.keys(commonIngredients).forEach(ingredient => {
                if (mealText.includes(ingredient)) {
                    foundIngredients.add(ingredient);
                }
            });
        });
    });
    
    // Adiciona ingredientes à lista de compras
    const shoppingData = loadFromStorage(STORAGE_KEYS.shoppingList, {});
    let addedCount = 0;
    
    foundIngredients.forEach(ingredient => {
        const ingredientData = commonIngredients[ingredient];
        const category = ingredientData.category;
        
        if (!shoppingData[category]) shoppingData[category] = [];
        
        // Verifica se já existe
        const exists = shoppingData[category].some(item => 
            item.name.toLowerCase().includes(ingredient)
        );
        
        if (!exists) {
            shoppingData[category].push({
                id: Date.now() + Math.random(),
                name: ingredient.charAt(0).toUpperCase() + ingredient.slice(1),
                price: ingredientData.price,
                completed: false
            });
            addedCount++;
        }
    });
    
    saveToStorage(STORAGE_KEYS.shoppingList, shoppingData);
    loadShoppingList();
    
    showNotification(`${addedCount} ingredientes adicionados à lista! 🛒✨`, 'success');
    
    // Muda para aba de compras
    document.querySelector('[data-tab="shopping"]').click();
}

// ========================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ========================================
function initApp() {
    // Limpa dados antigos primeiro
    resetWeeklyData();
    
    // Carrega dados iniciais
    updateDayCounter();
    updateLastWorkoutDisplay();
    renderWeeklyChart();
    loadTodayNutrition();
    updateMotivationalQuote();
    
    // Inicializa novos sistemas
    initTabs();
    initShoppingList();
    initMealPlan();
    
    // Configura event listeners
    elements.workoutBtn.addEventListener('click', markWorkout);
    elements.saveNutritionBtn.addEventListener('click', saveNutrition);
    
    // Auto-save da alimentação a cada mudança
    const nutritionInputs = [elements.breakfast, elements.lunch, elements.dinner, elements.snacks];
    nutritionInputs.forEach(input => {
        input.addEventListener('input', () => {
            updateCharCounts();
            updateMealStats();
        });
        
        input.addEventListener('input', debounce(() => {
            if (input.value.trim()) {
                saveNutrition();
            }
        }, 2000));
        
        // Limita caracteres a 200
        input.addEventListener('input', () => {
            if (input.value.length > 200) {
                input.value = input.value.substring(0, 200);
                updateCharCounts();
            }
        });
    });
    
    // Atualiza frase motivacional a cada 10 segundos
    setInterval(updateMotivationalQuote, 10000);
    
    // Verifica se precisa resetar contador a cada hora
    setInterval(() => {
        updateDayCounter();
        updateLastWorkoutDisplay();
    }, 60000 * 60);
}

// ========================================
// UTILITÁRIO DE DEBOUNCE
// ========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========================================
// INICIALIZAÇÃO QUANDO O DOM CARREGAR
// ========================================
document.addEventListener('DOMContentLoaded', initApp);

// ========================================
// FUNÇÃO DE DEBUG
// ========================================
function debugInfo() {
    const today = new Date();
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    console.log('=== DEBUG INFO ===');
    console.log('Data atual:', formatDate(today));
    console.log('Dia da semana:', dayNames[today.getDay()]);
    console.log('Dados semanais:', loadFromStorage(STORAGE_KEYS.weeklyWorkouts, {}));
    console.log('Último treino:', loadFromStorage(STORAGE_KEYS.lastWorkout));
    console.log('=================');
}

// Chama debug ao carregar (temporário)
window.debugFitness = debugInfo;

// Funções globais para uso no HTML
window.toggleShoppingItem = toggleShoppingItem;
window.deleteShoppingItem = deleteShoppingItem;

// ========================================
// TRATAMENTO DE ERROS GLOBAIS
// ========================================
window.addEventListener('error', (event) => {
    console.error('Erro na aplicação:', event.error);
    showNotification('Ops! Algo deu errado. Tente novamente.', 'error');
});

// ========================================
// LIMPEZA AO FECHAR A PÁGINA
// ========================================
window.addEventListener('beforeunload', () => {
    // Salva estado atual da alimentação se houver dados
    const hasNutritionData = [elements.breakfast, elements.lunch, elements.dinner, elements.snacks]
        .some(input => input.value.trim());
    
    if (hasNutritionData) {
        saveNutrition();
    }
});