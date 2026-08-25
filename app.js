// ============================================
// DAILYSTREAK - APPLICATION COMPLÈTE
// Version 7.0.0 - Design System Pro
// ============================================

// Données de l'application
let appData = {
    streak: 0,
    bestStreak: 0,
    totalDays: 0,
    completedDays: 0,
    totalTime: 0,
    
    today: new Date().toISOString().split('T')[0],
    todayCompleted: false,
    completedExercises: 0,
    
    exercises: [],
    currentLevel: 'beginner',
    
    calendar: {},
    
    settings: {
        theme: 'dark',
        level: 'beginner',
        notifications: false,
        reminderTime: '18:00',
        vibration: true
    },
    
    timer: {
        running: false,
        seconds: 0,
        totalSeconds: 0,
        interval: null,
        exercise: ''
    },
    
    achievements: []
};

// Configuration des exercices par niveau
const exercisesConfig = {
    beginner: [
        { id: 1, name: "Gainage", duration: "30 secondes", time: 30, icon: "plank", completed: false },
        { id: 2, name: "Corde à sauter", duration: "1 minute", time: 60, icon: "rope", completed: false },
        { id: 3, name: "Pompes", duration: "5 répétitions", time: 45, icon: "pushup", completed: false },
        { id: 4, name: "Superman", duration: "30 secondes", time: 30, icon: "superman", completed: false }
    ],
    intermediate: [
        { id: 1, name: "Gainage", duration: "45 secondes", time: 45, icon: "plank", completed: false },
        { id: 2, name: "Corde à sauter", duration: "2 minutes", time: 120, icon: "rope", completed: false },
        { id: 3, name: "Pompes", duration: "10 répétitions", time: 60, icon: "pushup", completed: false },
        { id: 4, name: "Superman", duration: "45 secondes", time: 45, icon: "superman", completed: false },
        { id: 5, name: "Squats", duration: "15 répétitions", time: 45, icon: "squat", completed: false }
    ],
    advanced: [
        { id: 1, name: "Gainage", duration: "1 minute", time: 60, icon: "plank", completed: false },
        { id: 2, name: "Corde à sauter", duration: "3 minutes", time: 180, icon: "rope", completed: false },
        { id: 3, name: "Pompes", duration: "15 répétitions", time: 75, icon: "pushup", completed: false },
        { id: 4, name: "Superman", duration: "1 minute", time: 60, icon: "superman", completed: false },
        { id: 5, name: "Squats", duration: "20 répétitions", time: 60, icon: "squat", completed: false },
        { id: 6, name: "Burpees", duration: "10 répétitions", time: 90, icon: "burpee", completed: false }
    ]
};

// Configuration des succès
const achievementsConfig = [
    { id: 1, name: "Premier jour", desc: "Valide ta première journée", icon: "target", unlocked: false },
    { id: 2, name: "3 jours de suite", desc: "3 jours consécutifs", icon: "flame", unlocked: false },
    { id: 3, name: "Semaine complète", desc: "7 jours consécutifs", icon: "trophy", unlocked: false },
    { id: 4, name: "Mois complet", desc: "30 jours consécutifs", icon: "rocket", unlocked: false },
    { id: 5, name: "Mode réduit", desc: "Utilise le mode réduit", icon: "moon", unlocked: false },
    { id: 6, name: "Journée parfaite", desc: "Tous les exercices faits", icon: "star", unlocked: false }
];

// Variable pour l'installation PWA
let deferredPrompt = null;

// ============================================
// INITIALISATION
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupInstallPrompt();
});

function initApp() {
    loadData();
    initUI();
    setupServiceWorker();
}

function initUI() {
    updateDate();
    loadExercises();
    updateDisplay();
    setTheme(appData.settings.theme);
    setupEventListeners();
    setupAccessibility();
}

// ============================================
// GESTION DES DONNÉES
// ============================================

function loadData() {
    try {
        const saved = localStorage.getItem('dailyStreakData');
        if (saved) {
            const data = JSON.parse(saved);
            checkNewDay(data);
            appData = { ...appData, ...data };
            
            if (appData.exercises && appData.exercises.length > 0) {
                appData.exercises = appData.exercises.map(ex => ({
                    ...ex,
                    completed: ex.completed || false
                }));
            }
        } else {
            createDefaultData();
        }
    } catch (error) {
        console.error('Erreur de chargement:', error);
        createDefaultData();
    }
    
    if (!appData.calendar || Object.keys(appData.calendar).length === 0) {
        initCalendar();
    }
    
    if (!appData.achievements || appData.achievements.length === 0) {
        appData.achievements = JSON.parse(JSON.stringify(achievementsConfig));
    }
}

function checkNewDay(savedData) {
    const today = new Date().toISOString().split('T')[0];
    
    if (savedData.today !== today) {
        appData.today = today;
        appData.todayCompleted = false;
        appData.completedExercises = 0;
        
        if (appData.exercises && appData.exercises.length > 0) {
            appData.exercises = appData.exercises.map(ex => ({
                ...ex,
                completed: false
            }));
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (savedData.calendar && savedData.calendar[yesterdayStr]) {
            if (!savedData.calendar[yesterdayStr].completed) {
                appData.streak = 0;
                showToast('Streak cassée. Recommence aujourd\'hui !', 'warning');
            }
        }
        
        saveData();
    }
}

function createDefaultData() {
    appData = {
        streak: 0,
        bestStreak: 0,
        totalDays: 0,
        completedDays: 0,
        totalTime: 0,
        today: new Date().toISOString().split('T')[0],
        todayCompleted: false,
        completedExercises: 0,
        exercises: JSON.parse(JSON.stringify(exercisesConfig.beginner)),
        currentLevel: 'beginner',
        calendar: {},
        settings: {
            theme: 'dark',
            level: 'beginner',
            notifications: false,
            reminderTime: '18:00',
            vibration: true
        },
        timer: {
            running: false,
            seconds: 0,
            totalSeconds: 0,
            interval: null,
            exercise: ''
        },
        achievements: JSON.parse(JSON.stringify(achievementsConfig))
    };
    
    initCalendar();
    saveData();
}

function initCalendar() {
    const calendar = {};
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        calendar[dateStr] = { completed: false, exercises: 0, time: 0 };
    }
    
    appData.calendar = calendar;
}

function saveData() {
    try {
        localStorage.setItem('dailyStreakData', JSON.stringify(appData));
    } catch (error) {
        console.error('Erreur de sauvegarde:', error);
        showToast('Erreur de sauvegarde', 'error');
    }
}

// ============================================
// INSTALLATION PWA
// ============================================

function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showInstallButton();
    });
    
    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        hideInstallButton();
        showToast('Application installée !', 'success');
    });
}

function showInstallButton() {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.classList.remove('hidden');
    }
}

function hideInstallButton() {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.classList.add('hidden');
    }
}

function installApp() {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            showToast('Installation en cours...', 'success');
        }
        deferredPrompt = null;
        hideInstallButton();
    });
}

// ============================================
// INTERFACE UTILISATEUR
// ============================================

function updateDate() {
    const now = new Date();
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    document.getElementById('currentDay').textContent = days[now.getDay()];
    document.getElementById('currentDate').textContent = `${now.getDate()} ${months[now.getMonth()]}`;
}

function loadExercises() {
    const level = appData.settings.level;
    appData.exercises = JSON.parse(JSON.stringify(exercisesConfig[level]));
    
    if (appData.exercises && appData.exercises.length > 0) {
        appData.exercises = appData.exercises.map(ex => ({
            ...ex,
            completed: ex.completed || false
        }));
    }
    
    renderExercises();
}

function renderExercises() {
    const container = document.getElementById('exercisesList');
    container.innerHTML = '';
    
    appData.exercises.forEach((exercise) => {
        const exerciseElement = document.createElement('div');
        exerciseElement.className = `exercise-item ${exercise.completed ? 'completed' : ''}`;
        exerciseElement.dataset.id = exercise.id;
        
        exerciseElement.innerHTML = `
            <div class="exercise-content" onclick="toggleExercise(${exercise.id})" role="button" tabindex="0" aria-label="${exercise.name} - ${exercise.duration} - ${exercise.completed ? 'Terminé' : 'À faire'}">
                <div class="exercise-checkbox" id="check${exercise.id}" aria-hidden="true">
                    ${exercise.completed ? '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>' : ''}
                </div>
                <div>
                    <div class="exercise-name">${exercise.name}</div>
                    <div class="exercise-duration">${exercise.duration}</div>
                </div>
            </div>
            <button class="exercise-timer" onclick="startExerciseTimer(${exercise.id})" aria-label="Démarrer le timer pour ${exercise.name}">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"/>
                </svg>
            </button>
        `;
        
        container.appendChild(exerciseElement);
    });
    
    updateProgress();
}

function toggleExercise(id) {
    const exerciseIndex = appData.exercises.findIndex(ex => ex.id === id);
    if (exerciseIndex === -1) return;
    
    const exercise = appData.exercises[exerciseIndex];
    exercise.completed = !exercise.completed;
    
    if (exercise.completed) {
        appData.completedExercises++;
    } else {
        appData.completedExercises--;
    }
    
    const exerciseElement = document.querySelector(`.exercise-item[data-id="${id}"]`);
    const checkbox = document.getElementById(`check${id}`);
    
    if (exerciseElement && checkbox) {
        exerciseElement.classList.toggle('completed', exercise.completed);
        checkbox.innerHTML = exercise.completed ? '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>' : '';
        
        if (exercise.completed) {
            exerciseElement.style.transform = 'scale(1.02)';
            setTimeout(() => {
                exerciseElement.style.transform = 'scale(1)';
            }, 200);
        }
    }
    
    updateProgress();
    saveData();
    checkAchievements();
    playClickSound();
}

function updateProgress() {
    const total = appData.exercises.length;
    const percentage = total > 0 ? (appData.completedExercises / total) * 100 : 0;
    
    document.getElementById('todayProgress').textContent = `${appData.completedExercises}/${total}`;
    
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = `${percentage}%`;
    
    const validateBtn = document.getElementById('validateBtn');
    if (appData.completedExercises > 0 && !appData.todayCompleted) {
        validateBtn.disabled = false;
        validateBtn.style.opacity = '1';
        validateBtn.setAttribute('aria-label', `Valider ma journée (${appData.completedExercises}/${total} exercices terminés)`);
    } else {
        validateBtn.disabled = true;
        validateBtn.style.opacity = '0.5';
        validateBtn.setAttribute('aria-label', 'Valider ma journée (non disponible)');
    }
}

function updateDisplay() {
    document.getElementById('streakCount').textContent = appData.streak;
    document.getElementById('currentStreak').textContent = appData.streak;
    document.getElementById('bestStreak').textContent = appData.bestStreak;
    document.getElementById('totalDays').textContent = appData.completedDays;
    document.getElementById('totalTime').textContent = Math.floor(appData.totalTime / 60);
    
    updateProgress();
    updateWeekChain();
    updateCalendar();
    updateAchievements();
    updateSettings();
}

function updateWeekChain() {
    const container = document.getElementById('weekChain');
    if (!container) return;
    
    container.innerHTML = '';
    
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = appData.calendar[dateStr];
        
        const dayElement = document.createElement('div');
        dayElement.className = 'day-circle';
        dayElement.setAttribute('aria-label', `${date.getDate()} - ${dayData && dayData.completed ? 'Terminé' : 'Non terminé'}`);
        
        if (i === 0) {
            dayElement.classList.add('today');
            dayElement.setAttribute('aria-label', `${date.getDate()} - Aujourd'hui`);
        } else if (dayData && dayData.completed) {
            dayElement.classList.add('done');
        }
        
        dayElement.textContent = date.getDate();
        container.appendChild(dayElement);
    }
}

function updateCalendar() {
    const container = document.getElementById('calendar');
    container.innerHTML = '';
    
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day';
        container.appendChild(empty);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(today.getFullYear(), today.getMonth(), day);
        const dateStr = date.toISOString().split('T')[0];
        const dayData = appData.calendar[dateStr];
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        dayElement.setAttribute('aria-label', `${day} - ${dayData && dayData.completed ? 'Terminé' : 'Non terminé'}`);
        
        if (day === today.getDate() && today.getMonth() === new Date().getMonth()) {
            dayElement.classList.add('today');
            dayElement.setAttribute('aria-label', `${day} - Aujourd'hui`);
        } else if (dayData && dayData.completed) {
            dayElement.classList.add('done');
        }
        
        container.appendChild(dayElement);
    }
}

function updateAchievements() {
    const container = document.getElementById('achievements');
    if (!container) return;
    
    container.innerHTML = '';
    
    appData.achievements.forEach(achievement => {
        const achievementElement = document.createElement('div');
        achievementElement.className = `achievement ${achievement.unlocked ? '' : 'locked'}`;
        achievementElement.setAttribute('aria-label', `${achievement.name} - ${achievement.desc} - ${achievement.unlocked ? 'Débloqué' : 'Verrouillé'}`);
        
        achievementElement.innerHTML = `
            <div class="achievement-icon">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    ${getAchievementIcon(achievement.icon)}
                </svg>
            </div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        `;
        
        container.appendChild(achievementElement);
    });
}

function getAchievementIcon(icon) {
    const icons = {
        target: '<path fill="currentColor" d="M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14Z"/>',
        flame: '<path fill="currentColor" d="M17.5,1.917a6.4,6.4,0,0,0-5.5,3.3,6.4,6.4,0,0,0-5.5-3.3A6.8,6.8,0,0,0,0,8.967c0,4.547,4.786,9.513,8.8,12.88a4.974,4.974,0,0,0,6.4,0C19.214,18.48,24,13.514,24,8.967A6.8,6.8,0,0,0,17.5,1.917Zm-3.585,18.4a2.973,2.973,0,0,1-3.83,0C4.947,16.006,2,11.87,2,8.967a4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,11,8.967a1,1,0,0,0,2,0,4.8,4.8,0,0,1,4.5-5.05A4.8,4.8,0,0,1,22,8.967C22,11.87,19.053,16.006,13.915,20.313Z"/>',
        trophy: '<path fill="currentColor" d="M18,2H22V8H18V16H8V22H16V24H6V16H2V8H6V2H18M18,8V4H6V8H8V14H16V8H18Z"/>',
        rocket: '<path fill="currentColor" d="M13,13C11.9,13 11,12.1 11,11C11,9.9 11.9,9 13,9C14.1,9 15,9.9 15,11C15,12.1 14.1,13 13,13M6,21L7,17L4,14L6,21M18,3C14.8,3 12.4,4.8 10.8,7.3L10.2,8.2C9.4,8.2 8.6,8.5 7.9,9.2L5.5,11.6C5.1,12 5.1,12.6 5.5,13L7,14.5C7.4,14.9 8,14.9 8.4,14.5L10.8,12.1C11.5,11.4 11.8,10.6 11.8,9.8L12.7,9.2C15.2,7.6 17,5.2 18,3Z"/>',
        moon: '<path fill="currentColor" d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.64 6.35,17.66C9.37,20.67 14.19,20.78 17.33,17.97Z"/>',
        star: '<path fill="currentColor" d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>'
    };
    
    return icons[icon] || icons.target;
}

function updateSettings() {
    const reminderTime = document.getElementById('reminderTime');
    const notificationsToggle = document.getElementById('notificationsToggle');
    
    if (reminderTime) {
        reminderTime.value = appData.settings.reminderTime;
        reminderTime.setAttribute('aria-label', 'Heure de rappel quotidien');
    }
    
    if (notificationsToggle) {
        notificationsToggle.checked = appData.settings.notifications;
        notificationsToggle.setAttribute('aria-label', 'Activer/désactiver les notifications');
    }
    
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
        const level = btn.querySelector('span').textContent.toLowerCase();
        if (level.includes(appData.settings.level)) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active');
        if ((appData.settings.theme === 'light' && btn.textContent.includes('Clair')) ||
            (appData.settings.theme === 'dark' && btn.textContent.includes('Sombre'))) {
            btn.classList.add('active');
        }
    });
}

// ============================================
// FONCTIONNALITÉS PRINCIPALES
// ============================================

function validateDay() {
    if (appData.todayCompleted) {
        showToast('Journée déjà validée !', 'info');
        return;
    }
    
    if (appData.completedExercises === 0) {
        showToast('Fais au moins un exercice !', 'error');
        return;
    }
    
    const totalTime = appData.exercises
        .filter(ex => ex.completed)
        .reduce((sum, ex) => sum + ex.time, 0);
    
    appData.todayCompleted = true;
    appData.streak++;
    appData.totalDays++;
    appData.completedDays++;
    appData.totalTime += totalTime;
    
    if (appData.streak > appData.bestStreak) {
        appData.bestStreak = appData.streak;
    }
    
    appData.calendar[appData.today] = {
        completed: true,
        exercises: appData.completedExercises,
        time: totalTime
    };
    
    showToast(`Nouvelle streak : ${appData.streak} jours !`, 'success');
    playSuccessSound();
    vibrate([100, 50, 100]);
    
    const streakElement = document.getElementById('streakCount');
    streakElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        streakElement.style.transform = 'scale(1)';
    }, 300);
    
    const validateBtn = document.getElementById('validateBtn');
    validateBtn.disabled = true;
    validateBtn.style.opacity = '0.5';
    validateBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg><span>Journée validée !</span>';
    
    updateDisplay();
    saveData();
    checkAchievements();
}

function toggleTiredMode() {
    const tiredCard = document.getElementById('tiredCard');
    const isHidden = tiredCard.classList.toggle('hidden');
    playClickSound();
    
    const tiredBtn = document.getElementById('tiredModeBtn');
    tiredBtn.setAttribute('aria-label', isHidden ? 'Afficher le mode réduit' : 'Cacher le mode réduit');
}

function completeTired(type) {
    playClickSound();
    
    if (type === 'plank') {
        if (appData.exercises[0]) {
            toggleExercise(appData.exercises[0].id);
        }
    } else if (type === 'squats') {
        appData.completedExercises++;
        updateProgress();
        saveData();
    }
    
    const tiredAchievement = appData.achievements.find(a => a.id === 5);
    if (tiredAchievement && !tiredAchievement.unlocked) {
        tiredAchievement.unlocked = true;
        showToast('Succès débloqué : Mode réduit !', 'success');
    }
    
    toggleTiredMode();
    showToast('Exercice rapide ajouté !', 'success');
}

// ============================================
// TIMER
// ============================================

function startExerciseTimer(exerciseId) {
    const exercise = appData.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    playClickSound();
    
    const timerCard = document.getElementById('timerCard');
    timerCard.classList.remove('hidden');
    document.getElementById('timerExercise').textContent = exercise.name;
    
    appData.timer.seconds = 0;
    appData.timer.totalSeconds = exercise.time;
    appData.timer.exercise = exercise.name;
    
    updateTimerDisplay();
}

function startTimer() {
    if (appData.timer.running) return;
    
    playClickSound();
    appData.timer.running = true;
    appData.timer.interval = setInterval(() => {
        appData.timer.seconds++;
        updateTimerDisplay();
        
        if (appData.timer.seconds >= appData.timer.totalSeconds) {
            clearInterval(appData.timer.interval);
            appData.timer.running = false;
            showToast(`${appData.timer.exercise} terminé !`, 'success');
            playSuccessSound();
            vibrate([200, 100, 200]);
            
            const exercise = appData.exercises.find(ex => ex.name === appData.timer.exercise);
            if (exercise && !exercise.completed) {
                toggleExercise(exercise.id);
            }
        }
    }, 1000);
}

function pauseTimer() {
    if (!appData.timer.running) return;
    
    playClickSound();
    clearInterval(appData.timer.interval);
    appData.timer.running = false;
}

function resetTimer() {
    playClickSound();
    pauseTimer();
    appData.timer.seconds = 0;
    updateTimerDisplay();
}

function hideTimer() {
    playClickSound();
    document.getElementById('timerCard').classList.add('hidden');
    resetTimer();
}

function updateTimerDisplay() {
    const minutes = Math.floor(appData.timer.seconds / 60);
    const seconds = appData.timer.seconds % 60;
    document.getElementById('timerDisplay').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// ============================================
// SUCCÈS
// ============================================

function checkAchievements() {
    let newAchievements = false;
    
    if (appData.streak >= 1) {
        const achievement = appData.achievements.find(a => a.id === 1);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            newAchievements = true;
        }
    }
    
    if (appData.streak >= 3) {
        const achievement = appData.achievements.find(a => a.id === 2);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            newAchievements = true;
        }
    }
    
    if (appData.streak >= 7) {
        const achievement = appData.achievements.find(a => a.id === 3);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            newAchievements = true;
        }
    }
    
    if (appData.streak >= 30) {
        const achievement = appData.achievements.find(a => a.id === 4);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            newAchievements = true;
        }
    }
    
    if (appData.completedExercises === appData.exercises.length) {
        const achievement = appData.achievements.find(a => a.id === 6);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            newAchievements = true;
        }
    }
    
    if (newAchievements) {
        showToast('Nouveau succès débloqué !', 'success');
        updateAchievements();
        saveData();
    }
}

// ============================================
// NAVIGATION ET ÉCRANS
// ============================================

function switchScreen(screen) {
    playClickSound();
    
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.screen').forEach(screenElement => {
        screenElement.classList.remove('active');
    });
    
    const screenElement = document.getElementById(`${screen}Screen`);
    if (screenElement) {
        screenElement.classList.add('active');
    }
    
    const navBtn = document.querySelector(`.nav-item[onclick*="${screen}"]`);
    if (navBtn) {
        navBtn.classList.add('active');
    }
    
    if (screen === 'stats' || screen === 'home') {
        updateDisplay();
    }
}

// ============================================
// PARAMÈTRES
// ============================================

function setTheme(theme) {
    playClickSound();
    appData.settings.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    saveData();
    showToast(`Thème ${theme === 'light' ? 'clair' : 'sombre'} activé`, 'success');
}

function setLevel(level) {
    playClickSound();
    appData.settings.level = level;
    appData.currentLevel = level;
    
    appData.completedExercises = 0;
    appData.todayCompleted = false;
    
    loadExercises();
    updateDisplay();
    saveData();
    
    showToast(`Niveau ${level} activé`, 'success');
}

function resetData() {
    playClickSound();
    if (confirm('Es-tu sûr de vouloir tout réinitialiser ?')) {
        if (confirm('Dernière chance ! Toutes tes données seront effacées.')) {
            localStorage.clear();
            createDefaultData();
            loadExercises();
            updateDisplay();
            showToast('Données réinitialisées', 'success');
            vibrate([200, 100, 200]);
        }
    }
}

// ============================================
// ACCESSIBILITÉ
// ============================================

function setupAccessibility() {
    setInterval(updateAriaLabels, 1000);
    
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    updateAriaLabels();
}

function updateAriaLabels() {
    const timerButtons = document.querySelectorAll('.timer-btn');
    if (timerButtons.length >= 3) {
        timerButtons[0].setAttribute('aria-label', 'Démarrer le timer');
        timerButtons[1].setAttribute('aria-label', 'Mettre en pause le timer');
        timerButtons[2].setAttribute('aria-label', 'Réinitialiser le timer');
    }
    
    const navButtons = document.querySelectorAll('.nav-item');
    navButtons.forEach((btn, index) => {
        const labels = ['Accueil', 'Statistiques', 'Paramètres'];
        if (!btn.hasAttribute('aria-label')) {
            btn.setAttribute('aria-label', labels[index] || 'Navigation');
        }
    });
    
    const backButtons = document.querySelectorAll('.icon-btn[onclick*="home"]');
    backButtons.forEach(btn => {
        if (!btn.hasAttribute('aria-label')) {
            btn.setAttribute('aria-label', 'Retour à l\'accueil');
        }
    });
    
    const statsBtn = document.querySelector('.stats-btn');
    if (statsBtn && !statsBtn.hasAttribute('aria-label')) {
        statsBtn.setAttribute('aria-label', 'Voir les statistiques');
    }
    
    const validateBtn = document.getElementById('validateBtn');
    if (validateBtn) {
        const completed = appData.completedExercises || 0;
        const total = appData.exercises?.length || 4;
        const label = appData.todayCompleted 
            ? 'Journée déjà validée' 
            : `Valider ma journée (${completed}/${total} exercices terminés)`;
        validateBtn.setAttribute('aria-label', label);
    }
}

function handleKeyboardNavigation(e) {
    if (e.key === 'Escape') {
        const timerCard = document.getElementById('timerCard');
        if (!timerCard.classList.contains('hidden')) {
            hideTimer();
        }
        
        const tiredCard = document.getElementById('tiredCard');
        if (!tiredCard.classList.contains('hidden')) {
            toggleTiredMode();
        }
    }
    
    if (e.key >= '1' && e.key <= '6') {
        const exerciseIndex = parseInt(e.key) - 1;
        if (appData.exercises[exerciseIndex]) {
            toggleExercise(appData.exercises[exerciseIndex].id);
        }
    }
    
    if (e.altKey) {
        switch(e.key) {
            case '1': switchScreen('home'); break;
            case '2': switchScreen('stats'); break;
            case '3': switchScreen('settings'); break;
            case 'v': 
                if (!document.getElementById('validateBtn').disabled) {
                    validateDay();
                }
                break;
            case 't': toggleTiredMode(); break;
        }
    }
    
    if (e.key === ' ' && !e.target.closest('input, textarea, button')) {
        e.preventDefault();
        const validateBtn = document.getElementById('validateBtn');
        if (!validateBtn.disabled) {
            validateDay();
        }
    }
}

// ============================================
// UTILITAIRES
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
    
    const icons = {
        success: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>',
        error: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>',
        warning: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M13,14H11V9H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/></svg>',
        info: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/></svg>'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function playSuccessSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('Audio non supporté');
    }
}

function playClickSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.log('Audio non supporté');
    }
}

function vibrate(pattern) {
    if (!appData.settings.vibration) return;
    if (!navigator.vibrate) return;
    
    try {
        navigator.vibrate(pattern);
    } catch (error) {
        console.log('Vibration non supportée');
    }
}

// ============================================
// ÉVÉNEMENTS ET SERVICE WORKER
// ============================================

function setupEventListeners() {
    window.addEventListener('online', () => {
        showToast('Connexion rétablie', 'success');
    });
    
    window.addEventListener('offline', () => {
        showToast('Mode hors ligne', 'warning');
    });
    
    window.addEventListener('beforeunload', () => {
        saveData();
    });
}

function setupServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker enregistré avec succès');
            })
            .catch(error => {
                console.error('Erreur SW:', error);
            });
    } else {
        console.log('Service Worker non supporté');
    }
}