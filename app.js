// ============================================
// DAILYSTREAK - APPLICATION COMPLÈTE
// Version 3.0.0 - Accessibilité et notifications
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
        { id: 1, name: "Gainage", duration: "30 secondes", time: 30, icon: "🛏️", completed: false },
        { id: 2, name: "Corde à sauter", duration: "1 minute", time: 60, icon: "🏃", completed: false },
        { id: 3, name: "Pompes", duration: "5 répétitions", time: 45, icon: "💪", completed: false },
        { id: 4, name: "Superman", duration: "30 secondes", time: 30, icon: "🦸", completed: false }
    ],
    intermediate: [
        { id: 1, name: "Gainage", duration: "45 secondes", time: 45, icon: "🛏️", completed: false },
        { id: 2, name: "Corde à sauter", duration: "2 minutes", time: 120, icon: "🏃", completed: false },
        { id: 3, name: "Pompes", duration: "10 répétitions", time: 60, icon: "💪", completed: false },
        { id: 4, name: "Superman", duration: "45 secondes", time: 45, icon: "🦸", completed: false },
        { id: 5, name: "Squats", duration: "15 répétitions", time: 45, icon: "🦵", completed: false }
    ],
    advanced: [
        { id: 1, name: "Gainage", duration: "1 minute", time: 60, icon: "🛏️", completed: false },
        { id: 2, name: "Corde à sauter", duration: "3 minutes", time: 180, icon: "🏃", completed: false },
        { id: 3, name: "Pompes", duration: "15 répétitions", time: 75, icon: "💪", completed: false },
        { id: 4, name: "Superman", duration: "1 minute", time: 60, icon: "🦸", completed: false },
        { id: 5, name: "Squats", duration: "20 répétitions", time: 60, icon: "🦵", completed: false },
        { id: 6, name: "Burpees", duration: "10 répétitions", time: 90, icon: "⚡", completed: false }
    ]
};

// Configuration des succès
const achievementsConfig = [
    { id: 1, name: "Premier jour", desc: "Valide ta première journée", icon: "🎯", unlocked: false },
    { id: 2, name: "3 jours de suite", desc: "3 jours consécutifs", icon: "🔥", unlocked: false },
    { id: 3, name: "Semaine complète", desc: "7 jours consécutifs", icon: "🏆", unlocked: false },
    { id: 4, name: "Mois complet", desc: "30 jours consécutifs", icon: "🚀", unlocked: false },
    { id: 5, name: "Mode réduit", desc: "Utilise le mode réduit", icon: "😴", unlocked: false },
    { id: 6, name: "Journée parfaite", desc: "Tous les exercices faits", icon: "⭐", unlocked: false }
];

// Notification ID pour le rappel quotidien
let reminderNotificationId = null;
let notificationCheckInterval = null;

// ============================================
// INITIALISATION
// ============================================

// Au chargement de la page
window.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Initialiser l'application
function initApp() {
    loadData();
    initUI();
    setupServiceWorker();
    
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('app').style.display = 'flex';
        showToast('Bienvenue sur DailyStreak !', 'success');
        checkAndScheduleReminder();
    }, 1000);
}

// Initialiser l'interface
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
                showToast('Streak cassée 😢 Recommence aujourd\'hui !', 'warning');
            }
        }
        
        if (appData.settings.notifications) {
            showNewDayNotification();
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
                    ${exercise.completed ? '✓' : ''}
                </div>
                <div>
                    <div class="exercise-name">${exercise.icon} ${exercise.name}</div>
                    <div class="exercise-duration">${exercise.duration}</div>
                </div>
            </div>
            <button class="exercise-timer" onclick="startExerciseTimer(${exercise.id})" aria-label="Démarrer le timer pour ${exercise.name}">
                ⏱️
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
        checkbox.textContent = exercise.completed ? '✓' : '';
        
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
            <div class="achievement-icon">${achievement.icon}</div>
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
    
    showToast(`🔥 Nouvelle streak : ${appData.streak} jours !`, 'success');
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
    validateBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg><span>Journée validée !</span>';
    
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
            showToast(`⏱️ ${appData.timer.exercise} terminé !`, 'success');
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
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.screen').forEach(screenElement => {
        screenElement.classList.remove('active');
    });
    
    const screenElement = document.getElementById(`${screen}Screen`);
    if (screenElement) {
        screenElement.classList.add('active');
    }
    
    const navBtn = document.querySelector(`.nav-btn[onclick*="${screen}"]`);
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

function exportData() {
    playClickSound();
    const dataStr = JSON.stringify(appData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `daily-streak-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('Données exportées', 'success');
}

function resetData() {
    playClickSound();
    if (confirm('⚠️ Es-tu sûr de vouloir tout réinitialiser ?')) {
        if (confirm('⚠️ Dernière chance ! Toutes tes données seront effacées.')) {
            cancelDailyReminder();
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
// NOTIFICATIONS - CORRECTIONS
// ============================================

function checkAndScheduleReminder() {
    if (!appData.settings.notifications) return;
    
    // Vérifier la permission et programmer le rappel
    if (Notification.permission === 'granted') {
        scheduleDailyReminder();
    } else if (Notification.permission === 'default') {
        // Demander la permission automatiquement
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
            showToast('Notifications activées !', 'success');
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
    
    // Si l'heure est passée, programmer pour demain
    if (reminderTime < now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    const timeUntilReminder = reminderTime.getTime() - now.getTime();
    
    // Programmer avec un timeout
    reminderNotificationId = setTimeout(() => {
        if (!appData.todayCompleted) {
            showReminderNotification();
        }
        // Re-programmer pour le jour suivant
        scheduleDailyReminder();
    }, timeUntilReminder);
    
    console.log('📅 Rappel programmé à:', reminderTime.toLocaleTimeString());
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
        body: 'N\'oublie pas ta routine sportive aujourd\'hui ! Ne romps pas la chaîne 💪',
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
    
    const notification = new Notification('🔥 DailyStreak - Rappel quotidien', options);
    
    notification.onclick = function(event) {
        event.preventDefault();
        window.focus();
        notification.close();
    };
    
    // Vérifier si l'API d'actions est supportée
    if ('actions' in Notification.prototype) {
        notification.onaction = function(event) {
            if (event.action === 'open') {
                window.focus();
            }
        };
    }
    
    // Fermer après 10 secondes
    setTimeout(() => {
        notification.close();
    }, 10000);
}

function showNewDayNotification() {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }
    
    const notification = new Notification('🌟 Nouveau jour !', {
        body: `Streak actuelle : ${appData.streak} jours. Fais ta routine aujourd'hui !`,
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
// ACCESSIBILITÉ
// ============================================

function setupAccessibility() {
    // Mettre à jour les labels ARIA dynamiquement
    setInterval(updateAriaLabels, 1000);
    
    // Gestion du clavier
    document.addEventListener('keydown', handleKeyboardNavigation);
    
    // Initialiser les labels
    updateAriaLabels();
}

function updateAriaLabels() {
    // Boutons du timer
    const timerButtons = document.querySelectorAll('.timer-btn');
    if (timerButtons.length >= 3) {
        timerButtons[0].setAttribute('aria-label', 'Démarrer le timer');
        timerButtons[1].setAttribute('aria-label', 'Mettre en pause le timer');
        timerButtons[2].setAttribute('aria-label', 'Réinitialiser le timer');
    }
    
    // Boutons de navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach((btn, index) => {
        const labels = ['Accueil', 'Statistiques', 'Paramètres'];
        if (!btn.hasAttribute('aria-label')) {
            btn.setAttribute('aria-label', labels[index] || 'Navigation');
        }
    });
    
    // Boutons de retour
    const backButtons = document.querySelectorAll('.icon-btn[onclick*="home"]');
    backButtons.forEach(btn => {
        if (!btn.hasAttribute('aria-label')) {
            btn.setAttribute('aria-label', 'Retour à l\'accueil');
        }
    });
    
    // Bouton de stats
    const statsBtn = document.querySelector('.stats-btn');
    if (statsBtn && !statsBtn.hasAttribute('aria-label')) {
        statsBtn.setAttribute('aria-label', 'Voir les statistiques');
    }
    
    // Bouton de validation
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
    // Échap pour fermer les modales
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
    
    // Touches numériques pour les exercices
    if (e.key >= '1' && e.key <= '6') {
        const exerciseIndex = parseInt(e.key) - 1;
        if (appData.exercises[exerciseIndex]) {
            toggleExercise(appData.exercises[exerciseIndex].id);
        }
    }
    
    // Raccourcis de navigation
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
    
    // Espace pour valider
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
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-content">
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
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
    // Gestion en ligne/hors ligne
    window.addEventListener('online', () => {
        showToast('Connexion rétablie', 'success');
    });
    
    window.addEventListener('offline', () => {
        showToast('Mode hors ligne', 'warning');
    });
    
    // Sauvegarde avant fermeture
    window.addEventListener('beforeunload', () => {
        saveData();
        cancelDailyReminder();
    });
    
    // Paramètres de notification
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
                console.log('✅ Service Worker enregistré avec succès');
                
                // Vérifier l'état
                if (registration.installing) {
                    console.log('SW installing');
                } else if (registration.waiting) {
                    console.log('SW waiting');
                } else if (registration.active) {
                    console.log('SW active');
                }
            })
            .catch(error => {
                console.error('❌ Erreur SW:', error);
            });
    } else {
        console.log('❌ Service Worker non supporté');
    }
}