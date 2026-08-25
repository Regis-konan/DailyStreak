// ============================================
// DAILYSTREAK - APPLICATION COMPLÈTE
// Version 5.1.0 - Tous les bugs corrigés
// ============================================

// Données de l'application
let appData = {
    streak: 0,
    bestStreak: 0,
    totalDays: 0,
    completedDays: 0,
    totalTime: 0,
    
    today: getLocalDateString(),
    todayCompleted: false,
    completedExercises: 0,
    
    exercises: [],
    currentLevel: 'beginner',
    
    calendar: {},
    
    settings: {
        theme: 'dark',
        level: 'beginner',
        notifications: true,
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
        { id: 1, name: "Gainage", duration: "30 secondes", time: 30, completed: false },
        { id: 2, name: "Corde à sauter", duration: "1 minute", time: 60, completed: false },
        { id: 3, name: "Pompes", duration: "5 répétitions", time: 45, completed: false },
        { id: 4, name: "Superman", duration: "30 secondes", time: 30, completed: false }
    ],
    intermediate: [
        { id: 1, name: "Gainage", duration: "45 secondes", time: 45, completed: false },
        { id: 2, name: "Corde à sauter", duration: "2 minutes", time: 120, completed: false },
        { id: 3, name: "Pompes", duration: "10 répétitions", time: 60, completed: false },
        { id: 4, name: "Superman", duration: "45 secondes", time: 45, completed: false },
        { id: 5, name: "Squats", duration: "15 répétitions", time: 45, completed: false }
    ],
    advanced: [
        { id: 1, name: "Gainage", duration: "1 minute", time: 60, completed: false },
        { id: 2, name: "Corde à sauter", duration: "3 minutes", time: 180, completed: false },
        { id: 3, name: "Pompes", duration: "15 répétitions", time: 75, completed: false },
        { id: 4, name: "Superman", duration: "1 minute", time: 60, completed: false },
        { id: 5, name: "Squats", duration: "20 répétitions", time: 60, completed: false },
        { id: 6, name: "Burpees", duration: "10 répétitions", time: 90, completed: false }
    ]
};

// Configuration des succès
const achievementsConfig = [
    { id: 1, name: "Premier jour", desc: "Validez votre première journée", icon: "flag", unlocked: false },
    { id: 2, name: "3 jours de suite", desc: "3 jours consécutifs", icon: "streak", unlocked: false },
    { id: 3, name: "Semaine complète", desc: "7 jours consécutifs", icon: "trophy", unlocked: false },
    { id: 4, name: "Mois complet", desc: "30 jours consécutifs", icon: "rocket", unlocked: false },
    { id: 5, name: "Mode réduit", desc: "Utiliser le mode réduit", icon: "zap", unlocked: false },
    { id: 6, name: "Journée parfaite", desc: "Tous les exercices faits et journée validée", icon: "star", unlocked: false }
];

// Icônes SVG pour les succès
const achievementIcons = {
    flag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>',
    streak: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
    trophy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0V4z"/><path d="M17 5h3a1 1 0 0 1 1 1c0 2-1 4-4 4M7 5H4a1 1 0 0 0-1 1c0 2 1 4 4 4"/></svg>',
    rocket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
    zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
};

// Notification ID pour le rappel quotidien
let reminderNotificationId = null;

// ============================================
// UTILITAIRES DATES
// ============================================

function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// ============================================
// INITIALISATION
// ============================================

function initApp() {
    loadData();
    initUI();
    setupServiceWorker();
    
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('app').style.display = 'flex';
        showToast('Bienvenue sur DailyStreak', 'success');
        checkAndScheduleReminder();
    }, 1000);
}

function initUI() {
    updateDate();
    loadExercises();
    updateDisplay();
    setTheme(appData.settings.theme, false); // Pas de son au démarrage
    setupEventListeners();
}

// ============================================
// GESTION DES DONNÉES
// ============================================

function loadData() {
    try {
        const saved = localStorage.getItem('dailyStreakData');
        
        if (saved) {
            const data = JSON.parse(saved);
            
            // Charger d'abord les données sauvegardées
            appData = { ...appData, ...data };
            
            // Vérifier ensuite si un nouveau jour est arrivé
            checkNewDay();
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
    
    saveData();
}

function checkNewDay() {
    const today = getLocalDateString();
    
    // Même jour : rien à faire
    if (appData.today === today) {
        return;
    }
    
    const previousDate = appData.today;
    
    // Mettre à jour la date
    appData.today = today;
    
    // Nouvelle journée
    appData.todayCompleted = false;
    appData.completedExercises = 0;
    
    // Réinitialiser les exercices du jour
    const level = appData.settings.level;
    appData.exercises = JSON.parse(JSON.stringify(exercisesConfig[level]));
    
    // Vérifier que le jour immédiatement précédent était validé
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayStr = getLocalDateString(yesterday);
    const yesterdayData = appData.calendar?.[yesterdayStr];
    
    if (!yesterdayData || !yesterdayData.completed) {
        if (appData.streak > 0) {
            appData.streak = 0;
            showToast('Streak interrompue. Recommencez aujourd\'hui', 'warning');
        }
    }
    
    // Préparer la journée actuelle dans le calendrier
    if (!appData.calendar) {
        appData.calendar = {};
    }
    
    appData.calendar[today] = {
        completed: false,
        exercises: 0,
        time: 0
    };
    
    // Notification nouveau jour
    if (appData.settings.notifications) {
        showNewDayNotification();
    }
    
    saveData();
}

function createDefaultData() {
    const today = getLocalDateString();
    
    appData = {
        streak: 0,
        bestStreak: 0,
        totalDays: 0,
        completedDays: 0,
        totalTime: 0,
        today: today,
        todayCompleted: false,
        completedExercises: 0,
        exercises: JSON.parse(JSON.stringify(exercisesConfig.beginner)),
        currentLevel: 'beginner',
        calendar: {},
        settings: {
            theme: 'dark',
            level: 'beginner',
            notifications: true,
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
        const dateStr = getLocalDateString(date);
        calendar[dateStr] = { completed: false, exercises: 0, time: 0 };
    }
    
    appData.calendar = calendar;
}

function saveData() {
    try {
        localStorage.setItem('dailyStreakData', JSON.stringify(appData));
    } catch (error) {
        console.error('Erreur de sauvegarde:', error);
    }
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
    
    // Si aucun exercice n'existe ou si le niveau a changé, on les crée
    if (!appData.exercises || appData.exercises.length === 0) {
        appData.exercises = JSON.parse(JSON.stringify(exercisesConfig[level]));
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
            <div class="exercise-content" onclick="toggleExercise(${exercise.id})" role="button" tabindex="0">
                <div class="exercise-checkbox" id="check${exercise.id}">
                    ${exercise.completed ? '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>' : ''}
                </div>
                <div>
                    <div class="exercise-name">${exercise.name}</div>
                    <div class="exercise-duration">${exercise.duration}</div>
                </div>
            </div>
            <button class="exercise-timer" onclick="startExerciseTimer(${exercise.id})">
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
    // 🔒 Verrouiller après validation
    if (appData.todayCompleted) {
        showToast('Journée déjà validée', 'info');
        return;
    }
    
    const exerciseIndex = appData.exercises.findIndex(ex => ex.id === id);
    if (exerciseIndex === -1) return;
    
    const exercise = appData.exercises[exerciseIndex];
    exercise.completed = !exercise.completed;
    
    // Toujours recalculer le compteur
    appData.completedExercises = appData.exercises.filter(ex => ex.completed).length;
    
    const exerciseElement = document.querySelector(`.exercise-item[data-id="${id}"]`);
    const checkbox = document.getElementById(`check${id}`);
    
    if (exerciseElement && checkbox) {
        exerciseElement.classList.toggle('completed', exercise.completed);
        checkbox.innerHTML = exercise.completed 
            ? '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>'
            : '';
        
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
    } else {
        validateBtn.disabled = true;
        validateBtn.style.opacity = '0.5';
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
    container.innerHTML = '';
    
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getLocalDateString(date);
        const dayData = appData.calendar[dateStr];
        
        const dayElement = document.createElement('div');
        dayElement.className = 'day-circle';
        
        if (i === 0) {
            dayElement.classList.add('today');
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
        const dateStr = getLocalDateString(date);
        const dayData = appData.calendar[dateStr];
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        if (day === today.getDate() && today.getMonth() === new Date().getMonth()) {
            dayElement.classList.add('today');
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
        
        achievementElement.innerHTML = `
            <div class="achievement-icon">${achievementIcons[achievement.icon] || achievementIcons.flag}</div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.desc}</div>
        `;
        
        container.appendChild(achievementElement);
    });
}

function updateSettings() {
    const reminderTime = document.getElementById('reminderTime');
    const notificationsToggle = document.getElementById('notificationsToggle');
    
    if (reminderTime) {
        reminderTime.value = appData.settings.reminderTime;
    }
    
    if (notificationsToggle) {
        notificationsToggle.checked = appData.settings.notifications;
    }
    
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.querySelector('span').textContent.toLowerCase().includes(appData.settings.level)) {
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
        showToast('Journée déjà validée', 'info');
        return;
    }
    
    if (appData.completedExercises === 0) {
        showToast('Faites au moins un exercice', 'error');
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
    
    showToast(`Nouvelle streak : ${appData.streak} jours`, 'success');
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
    validateBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg><span>Journée validée</span>';
    
    updateDisplay();
    saveData();
    checkAchievements();
}

function toggleTiredMode() {
    const tiredCard = document.getElementById('tiredCard');
    tiredCard.classList.toggle('hidden');
    playClickSound();
}

function completeTired(type) {
    // 🔒 Verrouiller après validation
    if (appData.todayCompleted) {
        showToast('Journée déjà validée', 'info');
        return;
    }
    
    playClickSound();
    
    let exerciseAdded = false;
    
    if (type === 'plank') {
        const exercise = appData.exercises[0];
        
        if (exercise && !exercise.completed) {
            toggleExercise(exercise.id);
            exerciseAdded = true;
        }
    } else if (type === 'squats') {
        const squats = appData.exercises.find(ex => ex.name.toLowerCase() === 'squats');
        
        if (squats && !squats.completed) {
            squats.completed = true;
            appData.completedExercises = appData.exercises.filter(ex => ex.completed).length;
            updateProgress();
            saveData();
            exerciseAdded = true;
        }
    }
    
    const tiredAchievement = appData.achievements.find(a => a.id === 5);
    if (tiredAchievement && !tiredAchievement.unlocked) {
        tiredAchievement.unlocked = true;
        showToast('Succès débloqué : Mode réduit', 'success');
    }
    
    toggleTiredMode();
    
    if (exerciseAdded) {
        showToast('Exercice rapide ajouté', 'success');
    }
}

// ============================================
// TIMER
// ============================================

function startExerciseTimer(exerciseId) {
    // 🔒 Verrouiller après validation
    if (appData.todayCompleted) {
        showToast('Journée déjà validée', 'info');
        return;
    }
    
    const exercise = appData.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    playClickSound();
    
    // ⛔ Stopper un éventuel timer précédent
    if (appData.timer.running) {
        clearInterval(appData.timer.interval);
        appData.timer.running = false;
    }
    
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
            showToast(`${appData.timer.exercise} terminé`, 'success');
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
    
    // 🔒 Succès "Journée parfaite" seulement si la journée est validée
    if (appData.todayCompleted && appData.completedExercises === appData.exercises.length) {
        const achievement = appData.achievements.find(a => a.id === 6);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            newAchievements = true;
        }
    }
    
    if (newAchievements) {
        showToast('Nouveau succès débloqué', 'success');
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

function setTheme(theme, playSound = true) {
    if (playSound) {
        playClickSound();
    }
    
    appData.settings.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    saveData();
    
    if (playSound) {
        showToast(`Thème ${theme === 'light' ? 'clair' : 'sombre'} activé`, 'success');
    }
}

function setLevel(level) {
    playClickSound();
    
    appData.settings.level = level;
    appData.currentLevel = level;
    
    // Nouveau niveau = nouvelle liste d'exercices
    appData.exercises = JSON.parse(JSON.stringify(exercisesConfig[level]));
    
    appData.completedExercises = 0;
    // ⚠️ Ne PAS remettre todayCompleted = false !
    // On conserve l'état de validation de la journée
    
    updateProgress();
    renderExercises();
    updateDisplay();
    saveData();
    
    showToast(`Niveau ${level} activé`, 'success');
}

function exportData() {
    playClickSound();
    const dataStr = JSON.stringify(appData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `daily-streak-backup-${getLocalDateString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Données exportées', 'success');
}

function resetData() {
    playClickSound();
    if (confirm('Êtes-vous sûr de vouloir tout réinitialiser ?')) {
        if (confirm('Dernière chance ! Toutes vos données seront effacées.')) {
            cancelDailyReminder();
            // ⚠️ Remplacer localStorage.clear() par removeItem()
            localStorage.removeItem('dailyStreakData');
            createDefaultData();
            loadExercises();
            updateDisplay();
            showToast('Données réinitialisées', 'success');
            vibrate([200, 100, 200]);
        }
    }
}

// ============================================
// NOTIFICATIONS
// ============================================

function checkAndScheduleReminder() {
    if (!appData.settings.notifications) return;
    
    if (Notification.permission === 'granted') {
        scheduleDailyReminder();
    } else if (Notification.permission === 'default') {
        requestNotificationPermission();
    }
}

function requestNotificationPermission() {
    if (!('Notification' in window)) {
        showToast('Notifications non supportées', 'warning');
        return;
    }
    
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            showToast('Notifications activées', 'success');
            scheduleDailyReminder();
        } else if (permission === 'denied') {
            showToast('Notifications refusées. Activez-les dans les paramètres.', 'warning');
        }
    });
}

function scheduleDailyReminder() {
    cancelDailyReminder();
    
    if (!appData.settings.notifications || Notification.permission !== 'granted') {
        return;
    }
    
    const [hours, minutes] = appData.settings.reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    
    reminderTime.setHours(hours, minutes, 0, 0);
    
    if (reminderTime < now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    reminderNotificationId = setTimeout(() => {
        if (!appData.todayCompleted) {
            showReminderNotification();
        }
        scheduleDailyReminder();
    }, timeUntilReminder);
}

function cancelDailyReminder() {
    if (reminderNotificationId) {
        clearTimeout(reminderNotificationId);
        reminderNotificationId = null;
    }
}

function showReminderNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }
    
    const options = {
        body: 'N\'oubliez pas votre routine sportive aujourd\'hui ! Ne romps pas la chaîne.',
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png',
        tag: 'daily-reminder',
        requireInteraction: true,
        actions: [
            {
                action: 'open',
                title: 'Ouvrir l\'app'
            }
        ]
    };
    
    const notification = new Notification('DailyStreak - Rappel quotidien', options);
    
    notification.onclick = function(event) {
        event.preventDefault();
        window.focus();
        notification.close();
    };
    
    if ('actions' in Notification.prototype) {
        notification.onaction = function(event) {
            if (event.action === 'open') {
                window.focus();
            }
        };
    }
    
    setTimeout(() => {
        notification.close();
    }, 10000);
}

function showNewDayNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }
    
    const notification = new Notification('Nouveau jour !', {
        body: `Streak actuelle : ${appData.streak} jours. Faites votre routine aujourd'hui !`,
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png',
        tag: 'new-day',
        silent: true
    });
    
    notification.onclick = function() {
        window.focus();
        this.close();
    };
    
    setTimeout(() => {
        notification.close();
    }, 5000);
}

// ============================================
// UTILITAIRES
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>',
        error: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/></svg>',
        warning: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M13,14H11V9H13M13,18H11V16H13M1,21H23L12,2L1,21Z"/></svg>',
        info: '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M11,9H13V7H11M12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20M12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22M11,15H13V11H11V15Z"/></svg>'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
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
// ÉVÉNEMENTS
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
        cancelDailyReminder();
    });
    
    const reminderTime = document.getElementById('reminderTime');
    const notificationsToggle = document.getElementById('notificationsToggle');
    
    if (reminderTime) {
        reminderTime.addEventListener('change', (e) => {
            appData.settings.reminderTime = e.target.value;
            saveData();
            scheduleDailyReminder();
            showToast('Rappel enregistré', 'success');
        });
    }
    
    if (notificationsToggle) {
        notificationsToggle.addEventListener('change', (e) => {
            appData.settings.notifications = e.target.checked;
            saveData();
            
            if (e.target.checked) {
                if (Notification.permission === 'granted') {
                    scheduleDailyReminder();
                } else if (Notification.permission === 'default') {
                    requestNotificationPermission();
                }
            } else {
                cancelDailyReminder();
            }
            
            showToast(`Notifications ${e.target.checked ? 'activées' : 'désactivées'}`, 'success');
        });
    }
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
    }
}

// ============================================
// LANCEMENT - UNE SEULE FOIS
// ============================================

// Initialisation unique
document.addEventListener('DOMContentLoaded', initApp);