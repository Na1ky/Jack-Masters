document.addEventListener('DOMContentLoaded', () => {
    // Gestione Navbar dinamica
    const token = localStorage.getItem('token');
    const navbarContent = document.getElementById('navbarContent');
    
    if (navbarContent) {
        const ul = navbarContent.querySelector('ul.navbar-nav');
        if (ul) {
            let navHtml = `
                <li class="nav-item"><a class="nav-link" href="index.html">Home</a></li>
                <li class="nav-item"><a class="nav-link" href="game.html">Gioca</a></li>
                <li class="nav-item"><a class="nav-link" href="classification.html">Classifica</a></li>
            `;
            
            if (token) {
                navHtml += `
                    <li class="nav-item"><a class="nav-link" href="profile.html">Statistiche</a></li>
                    <li class="nav-item">
                        <a class="btn btn-outline-danger btn-sm px-3" href="#" id="logout-btn">Esci</a>
                    </li>
                `;
            } else {
                navHtml += `
                    <li class="nav-item">
                        <a class="btn btn-outline-success btn-sm px-3" href="login.html">Accedi</a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-success btn-sm px-3" href="register.html">Registrati</a>
                    </li>
                `;
            }
            ul.innerHTML = navHtml;

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    window.location.reload();
                });
            }
        }
    }

    // Gestione form Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        if (token) {
            window.location.href = 'index.html';
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('api/auth/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                
                if (result.success) {
                    localStorage.setItem('token', result.data.sessionId);
                    window.location.href = 'index.html';
                } else {
                    if (typeof ShowAlert === 'function') {
                        ShowAlert(result.error || 'Errore durante il login', 'danger');
                    } else {
                        alert(result.error || 'Errore durante il login');
                    }
                }
            } catch (err) {
                console.error(err);
                alert("Errore di connessione.");
            }
        });
    }

    // Gestione form Register
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        if (token) {
            window.location.href = 'index.html';
        }

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());
            
            try {
                const response = await fetch('api/auth/register.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                
                if (result.success) {
                    localStorage.setItem('token', result.data.sessionId);
                    window.location.href = 'index.html';
                } else {
                    if (typeof ShowAlert === 'function') {
                        ShowAlert(result.error || 'Errore durante la registrazione', 'danger');
                    } else {
                        alert(result.error || 'Errore durante la registrazione');
                    }
                }
            } catch (err) {
                console.error(err);
                alert("Errore di connessione.");
            }
        });
    }
});
