// Calendário de Treinos
let currentWeekOffset = 0;
let selectedDate = null;
let workouts = JSON.parse(localStorage.getItem('workouts')) || {};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderWeek();
    setupEventListeners();
});

// Configuração do tema
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const toggleIcon = document.getElementById('toggleIcon');
    const toggleText = document.getElementById('toggleText');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        toggleIcon.textContent = '🌙';
        toggleText.textContent = 'Modo Escuro';
    }

    themeToggle?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        toggleIcon.textContent = isDark ? '🌙' : '🌞';
        toggleText.textContent = isDark ? 'Modo Escuro' : 'Modo Claro';
    });
}

// Configurar event listeners
function setupEventListeners() {
    document.getElementById('prevWeek')?.addEventListener('click', () => {
        currentWeekOffset--;
        renderWeek();
    });

    document.getElementById('nextWeek')?.addEventListener('click', () => {
        currentWeekOffset++;
        renderWeek();
    });

    document.getElementById('closeModal')?.addEventListener('click', () => {
        document.getElementById('workoutModal').classList.remove('active');
    });

    document.getElementById('workoutForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveWorkout();
    });

    // Fechar modal ao clicar fora
    document.getElementById('workoutModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'workoutModal') {
            document.getElementById('workoutModal').classList.remove('active');
        }
    });
}

// Renderizar semana
function renderWeek() {
    const weekGrid = document.getElementById('weekGrid');
    if (!weekGrid) return;

    weekGrid.innerHTML = '';

    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Começar na segunda-feira
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + diff + (currentWeekOffset * 7));

    // Atualizar título da semana
    const weekTitle = document.getElementById('weekTitle');
    if (weekTitle) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekTitle.textContent = `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
    }

    // Dias da semana
    const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateKey = getDateKey(date);
        const workout = workouts[dateKey];

        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        if (workout) {
            dayCard.classList.add('has-workout');
        }

        const isToday = isSameDay(date, today);
        if (isToday) {
            dayCard.style.borderColor = '#ffd700';
        }

        dayCard.innerHTML = `
            <div class="day-header">
                <span class="day-name">${daysOfWeek[i]}</span>
                ${isToday ? '<span style="font-size: 12px;">📍</span>' : ''}
            </div>
            <div class="day-number">${date.getDate()}</div>
            ${workout ? `
                <div class="workout-type">${getWorkoutEmoji(workout.type)}</div>
                <div class="workout-name">${getWorkoutName(workout.type)}</div>
                ${workout.exercises ? `
                    <div class="workout-preview">
                        <div class="preview-label">📋 Exercícios:</div>
                        <div class="preview-text">${truncateText(workout.exercises, 60)}</div>
                    </div>
                ` : ''}
                ${workout.completed ? `
                    <div class="workout-status completed">✅ Concluído</div>
                ` : `
                    <div class="workout-status pending">⏳ Pendente</div>
                `}
            ` : `
                <button class="add-workout-btn">+ Adicionar</button>
            `}
        `;

        dayCard.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-workout-btn')) {
                openWorkoutModal(date);
            } else {
                selectDay(date);
            }
        });

        weekGrid.appendChild(dayCard);
    }
}

// Selecionar dia
function selectDay(date) {
    selectedDate = date;
    const dateKey = getDateKey(date);
    const workout = workouts[dateKey];

    // Atualizar seleção visual
    document.querySelectorAll('.day-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget?.classList.add('selected');

    // Mostrar detalhes
    const detailsDiv = document.getElementById('workoutDetails');
    if (!detailsDiv) return;

    if (workout) {
        detailsDiv.innerHTML = `
            <h3>Treino de ${formatDateFull(date)}</h3>
            <div class="workout-info">
                <div class="workout-info-item">
                    <div class="workout-info-label">Tipo de Treino</div>
                    <div class="workout-info-content">
                        ${getWorkoutEmoji(workout.type)} ${getWorkoutName(workout.type)}
                    </div>
                </div>
                ${workout.exercises ? `
                    <div class="workout-info-item">
                        <div class="workout-info-label">Exercícios</div>
                        <div class="workout-info-content">${workout.exercises}</div>
                    </div>
                ` : ''}
                ${workout.notes ? `
                    <div class="workout-info-item">
                        <div class="workout-info-label">Observações</div>
                        <div class="workout-info-content">${workout.notes}</div>
                    </div>
                ` : ''}
                ${workout.duration ? `
                    <div class="workout-info-item">
                        <div class="workout-info-label">⏱️ Duração</div>
                        <div class="workout-info-content">${workout.duration} minutos</div>
                    </div>
                ` : ''}
                ${workout.intensity ? `
                    <div class="workout-info-item">
                        <div class="workout-info-label">🔥 Intensidade</div>
                        <div class="workout-info-content">${getIntensityText(workout.intensity)}</div>
                    </div>
                ` : ''}
                <div class="workout-info-item">
                    <div class="workout-info-label">Status</div>
                    <div class="workout-info-content">
                        ${workout.completed ? '✅ Treino Concluído' : '⏳ Treino Pendente'}
                    </div>
                </div>
            </div>
            <div class="workout-actions">
                ${!workout.completed ? `
                    <button class="complete-workout-btn" onclick="completeWorkout('${dateKey}')">
                        ✅ Marcar como Concluído
                    </button>
                ` : `
                    <button class="uncomplete-workout-btn" onclick="uncompleteWorkout('${dateKey}')">
                        ↩️ Desmarcar Conclusão
                    </button>
                `}
                <button class="edit-workout-btn" onclick="openWorkoutModal(new Date('${date.toISOString()}'))">
                    ✏️ Editar Treino
                </button>
                <button class="delete-workout-btn" onclick="deleteWorkout('${dateKey}')">
                    🗑️ Excluir Treino
                </button>
            </div>
        `;
    } else {
        detailsDiv.innerHTML = `
            <h3>Treino de ${formatDateFull(date)}</h3>
            <p class="select-day-msg">Nenhum treino programado para este dia</p>
            <button class="edit-workout-btn" onclick="openWorkoutModal(new Date('${date.toISOString()}'))">
                Adicionar Treino
            </button>
        `;
    }
}

// Abrir modal de treino
function openWorkoutModal(date) {
    selectedDate = date;
    const dateKey = getDateKey(date);
    const workout = workouts[dateKey];

    const modal = document.getElementById('workoutModal');
    modal.classList.add('active');

    // Preencher form se já existir treino
    if (workout) {
        document.getElementById('workoutType').value = workout.type || '';
        document.getElementById('workoutExercises').value = workout.exercises || '';
        document.getElementById('workoutNotes').value = workout.notes || '';
        document.getElementById('workoutDuration').value = workout.duration || '';
        document.getElementById('workoutIntensity').value = workout.intensity || '';
    } else {
        document.getElementById('workoutForm').reset();
    }
}

// Tornar função global
window.openWorkoutModal = openWorkoutModal;

// Salvar treino
function saveWorkout() {
    if (!selectedDate) return;

    const dateKey = getDateKey(selectedDate);
    const type = document.getElementById('workoutType').value;
    const exercises = document.getElementById('workoutExercises').value;
    const notes = document.getElementById('workoutNotes').value;
    const duration = document.getElementById('workoutDuration')?.value;
    const intensity = document.getElementById('workoutIntensity')?.value;

    if (type) {
        workouts[dateKey] = { 
            type, 
            exercises, 
            notes,
            duration: duration || '',
            intensity: intensity || '',
            completed: workouts[dateKey]?.completed || false
        };
        localStorage.setItem('workouts', JSON.stringify(workouts));
        
        document.getElementById('workoutModal').classList.remove('active');
        renderWeek();
        selectDay(selectedDate);
    }
}

// Marcar treino como concluído
function completeWorkout(dateKey) {
    if (workouts[dateKey]) {
        workouts[dateKey].completed = true;
        localStorage.setItem('workouts', JSON.stringify(workouts));
        renderWeek();
        const date = new Date(dateKey);
        selectDay(date);
    }
}

// Desmarcar conclusão do treino
function uncompleteWorkout(dateKey) {
    if (workouts[dateKey]) {
        workouts[dateKey].completed = false;
        localStorage.setItem('workouts', JSON.stringify(workouts));
        renderWeek();
        const date = new Date(dateKey);
        selectDay(date);
    }
}

// Excluir treino
function deleteWorkout(dateKey) {
    if (confirm('Tem certeza que deseja excluir este treino?')) {
        delete workouts[dateKey];
        localStorage.setItem('workouts', JSON.stringify(workouts));
        renderWeek();
        document.getElementById('workoutDetails').innerHTML = `
            <h3>Detalhes do Treino</h3>
            <p class="select-day-msg">Selecione um dia para ver os detalhes do treino</p>
        `;
    }
}

// Tornar funções globais
window.openWorkoutModal = openWorkoutModal;
window.completeWorkout = completeWorkout;
window.uncompleteWorkout = uncompleteWorkout;
window.deleteWorkout = deleteWorkout;

// Utilitários
function getDateKey(date) {
    return date.toISOString().split('T')[0];
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

function formatDate(date) {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
}

function formatDateFull(date) {
    const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${daysOfWeek[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]}`;
}

function getWorkoutEmoji(type) {
    const emojis = {
        'peito': '💪',
        'costas': '🦾',
        'pernas': '🦵',
        'ombros': '🏋️',
        'bracos': '💪',
        'cardio': '🏃',
        'fullbody': '🔥'
    };
    return emojis[type] || '💪';
}

function getWorkoutName(type) {
    const names = {
        'peito': 'Peito',
        'costas': 'Costas',
        'pernas': 'Pernas',
        'ombros': 'Ombros',
        'bracos': 'Braços',
        'cardio': 'Cardio',
        'fullbody': 'Full Body'
    };
    return names[type] || type;
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function getIntensityText(intensity) {
    const intensities = {
        'low': '🟢 Leve',
        'medium': '🟡 Moderado',
        'high': '🔴 Intenso',
        'extreme': '🔥 Extremo'
    };
    return intensities[intensity] || intensity;
}
