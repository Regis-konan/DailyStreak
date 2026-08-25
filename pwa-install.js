// ============================================
// INSTALLATION PWA - SIMPLE ET EFFICACE
// ============================================

let deferredPrompt = null;
let installButton = null;

// 1. Créer le bouton d'installation
function createInstallButton() {
    // Supprimer si existe déjà
    const oldBtn = document.getElementById('pwa-install-btn');
    if (oldBtn) oldBtn.remove();
    
    // Créer le bouton
    const btn = document.createElement('button');
    btn.id = 'pwa-install-btn';
    btn.innerHTML = 'Installer l\'app';
    btn.setAttribute('aria-label', 'Installer l\'application DailyStreak');
    
    // Ajouter au DOM d'abord
    document.body.appendChild(btn);
    
    // Style CSS
    if (!document.getElementById('pwa-install-btn-style')) {
        const style = document.createElement('style');
        style.id = 'pwa-install-btn-style';
        style.textContent = `
            #pwa-install-btn {
                position: fixed;
                bottom: 100px;
                right: 20px;
                background: #FF6D29;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(255, 109, 41, 0.4);
                z-index: 10000;
                display: none;
                font-family: inherit;
                font-size: 14px;
                transition: all 0.3s ease;
            }
            #pwa-install-btn:hover {
                background: #E55A1F;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 109, 41, 0.6);
            }
            #pwa-install-btn:active {
                transform: translateY(0);
            }
            #pwa-install-btn:focus {
                outline: 2px solid #E55A1F;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }
    
    return btn;
}

// 2. Gérer l'installation
function handleInstallClick() {
    if (!deferredPrompt) {
        showInstallInstructions();
        return;
    }
    
    // Montrer la boîte d'installation
    deferredPrompt.prompt();
    
    // Attendre la réponse
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('Utilisateur a accepté l\'installation');
            if (installButton) {
                installButton.style.display = 'none';
            }
        } else {
            console.log('Utilisateur a refusé l\'installation');
        }
        
        deferredPrompt = null;
    });
}

function showInstallInstructions() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const instructions = isMobile 
        ? 'Pour installer DailyStreak :\n\n' +
          '1. Ouvrez le menu Chrome (...)\n' +
          '2. Sélectionnez "Ajouter à l\'écran d\'accueil"\n' +
          '3. Suivez les instructions'
        : 'Pour installer DailyStreak :\n\n' +
          '1. Cliquez sur les 3 points (...) en haut à droite de Chrome\n' +
          '2. Sélectionnez "Installer DailyStreak"\n' +
          '3. Suivez les instructions';
    
    alert(instructions);
}

// 3. Vérifier si l'app est déjà installée
function isRunningAsPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
}

// 4. Événements d'installation
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt déclenché');
    e.preventDefault();
    deferredPrompt = e;
    
    // Afficher le bouton
    installButton = document.getElementById('pwa-install-btn') || createInstallButton();
    installButton.style.display = 'block';
    
    // Ajouter l'événement de clic
    installButton.addEventListener('click', handleInstallClick);
    
    // Afficher un toast informatif
    setTimeout(() => {
        if (document.getElementById('toastContainer')) {
            showToast('DailyStreak peut être installé ! Cliquez sur le bouton en bas à droite.', 'info');
        }
    }, 2000);
});

window.addEventListener('appinstalled', (e) => {
    console.log('App installée avec succès');
    deferredPrompt = null;
    
    if (installButton) {
        installButton.style.display = 'none';
    }
    
    // Afficher un message de succès
    setTimeout(() => {
        if (document.getElementById('toastContainer')) {
            showToast('Application installée avec succès !', 'success');
        }
    }, 1000);
});

// 5. Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisation PWA');
    
    // Vérifier si déjà installée
    if (isRunningAsPWA()) {
        console.log('Application déjà installée');
        return;
    }
    
    // Créer le bouton d'installation
    installButton = createInstallButton();
    
    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('Service Worker enregistré avec succès');
                
                // Vérifier les mises à jour
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('Nouveau Service Worker trouvé');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Nouvelle version disponible');
                            if (document.getElementById('toastContainer')) {
                                showToast('Nouvelle mise à jour disponible ! Rechargez la page.', 'info');
                            }
                        }
                    });
                });
            })
            .catch(error => {
                console.error('Erreur Service Worker:', error);
            });
    } else {
        console.log('Service Worker non supporté');
    }
    
    // Test : Afficher le bouton après 5 secondes pour démo
    setTimeout(() => {
        if (!deferredPrompt && installButton.style.display === 'none') {
            console.log('Mode démo: affichage du bouton');
            installButton.style.display = 'block';
            installButton.innerHTML = 'Installer l\'app';
            installButton.style.background = '#FF6D29';
            
            // Réassigner le clic pour les instructions
            installButton.onclick = showInstallInstructions;
        }
    }, 5000);
});

// 6. Fonction utilitaire pour les toasts (si elle n'existe pas déjà)
if (typeof showToast !== 'function') {
    function showToast(message, type = 'info') {
        console.log(`Toast [${type}]: ${message}`);
    }
}