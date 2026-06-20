document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    let player = null;

    // Fetch user profile if logged in
    if (token) {
        try {
            const profileData = await WithLoader(() => ApiRequest('api/user/profile.php'));
            if (profileData.success) {
                player = profileData.data;
            }
        } catch (e) {
            localStorage.removeItem('token');
            if (typeof ShowAlert === 'function') ShowAlert("Sessione scaduta", "danger");
            console.error("Errore fetch profilo:", e);
        }
    }

    // Update Hero section based on login status
    const heroActions = document.getElementById('hero-actions');
    if (heroActions) {
        if (!player) {
            heroActions.innerHTML = `
                <a href="register.html" class="btn btn-success btn-lg px-5 me-3">
                    <i class="bi bi-person-plus-fill me-2"></i>Inizia a Giocare
                </a>
                <p class="mt-3 fs-6">
                    Hai già un account?
                    <a href="login.html" class="text-info text-decoration-underline">Accedi qui</a>
                </p>
            `;
        } else {
            heroActions.innerHTML = `
                <a href="game.html" class="btn btn-primary btn-lg px-5 me-3">
                    <i class="bi bi-controller me-2"></i>Continua la scalata!
                </a>
                <p class="mt-3 fs-6">Bentornato, <strong>${player.Username}</strong>!
                    Nuove sfide ti aspettano.</p>
            `;
        }
    }

    // Fetch levels
    try {
        const levelsData = await WithLoader(() => ApiRequest('api/game/levels.php'));
        if (levelsData.success && levelsData.data.length > 0) {
            const levels = levelsData.data;
            const container = document.getElementById('level-thumbnails-container');
            const display = document.getElementById('level-display');
            const mainImage = document.getElementById("main-level-image");
            const mainName = document.getElementById("main-level-name");
            const mainDesc = document.getElementById("main-level-desc");
            const mainFiches = document.getElementById("main-level-fiches");

            display.classList.remove('d-none');
            
            function updateMainDisplay(thumb) {
                const img = thumb.querySelector("img");
                mainImage.src = img.src;
                mainImage.alt = img.alt;
                mainName.textContent = thumb.dataset.name;
                mainDesc.textContent = thumb.dataset.desc;
                mainFiches.textContent = Number(thumb.dataset.fiches).toLocaleString();
            }

            levels.forEach(level => {
                const minFiches = level.MinFiches;
                const isUnlocked = player && player.Fiches >= minFiches;
                const opacity = isUnlocked ? "1" : "0.5";

                const thumbWrapper = document.createElement('div');
                thumbWrapper.className = 'thumb-wrapper';
                thumbWrapper.style.cssText = `flex: 0 0 auto; cursor: pointer; opacity: ${opacity};`;
                thumbWrapper.dataset.name = level.Name;
                thumbWrapper.dataset.desc = level.Desc;
                thumbWrapper.dataset.fiches = level.MinFiches;

                const img = document.createElement('img');
                img.src = level.ImagePath;
                img.alt = level.Name;
                img.className = 'rounded shadow';
                img.style.cssText = 'height: 100px; width: auto; object-fit: cover;';

                thumbWrapper.appendChild(img);
                container.appendChild(thumbWrapper);
            });

            const thumbnails = document.querySelectorAll(".level-thumbnails .thumb-wrapper");
            
            thumbnails.forEach(thumb => {
                thumb.addEventListener("click", () => {
                    updateMainDisplay(thumb);
                    thumbnails.forEach(t => {
                        t.style.opacity = t.dataset.unlocked === "false" ? "0.5" : t.style.opacity; 
                        // reset opacity properly depending if it was unlocked or not
                        // Wait, we need to store if it was unlocked to reset opacity correctly.
                        const f = Number(t.dataset.fiches);
                        t.style.opacity = (player && player.Fiches >= f) ? "1" : "0.5";
                        t.querySelector("img").style.borderColor = "transparent";
                    });

                    thumb.style.opacity = "1";
                    thumb.querySelector("img").style.borderColor = "#0d6efd";
                    thumb.querySelector("img").style.borderWidth = "2px";
                    thumb.querySelector("img").style.borderStyle = "solid";
                });
            });

            if (thumbnails.length > 0) {
                updateMainDisplay(thumbnails[0]);
                thumbnails[0].style.opacity = "1";
                thumbnails[0].querySelector("img").style.borderColor = "#0d6efd";
                thumbnails[0].querySelector("img").style.borderWidth = "2px";
                thumbnails[0].querySelector("img").style.borderStyle = "solid";
            }
        }
    } catch (e) {
        console.error("Errore fetch livelli:", e);
    }
});
