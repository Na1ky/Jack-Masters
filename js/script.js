let loaderRequests = 0;

function getLoader() {
    return document.querySelector(".loader");
}

function ShowLoader() {
    const loader = getLoader();
    if (!loader) return;

    loaderRequests += 1;
    loader.classList.remove("loader-hidden");
    loader.setAttribute("aria-busy", "true");
}

function HideLoader(force = false) {
    const loader = getLoader();
    if (!loader) return;

    loaderRequests = force ? 0 : Math.max(0, loaderRequests - 1);
    if (loaderRequests === 0) {
        loader.classList.add("loader-hidden");
        loader.setAttribute("aria-busy", "false");
    }
}

function ShowHideLoader(show) {
    if (typeof show === "boolean") {
        show ? ShowLoader() : HideLoader();
        return;
    }

    const loader = getLoader();
    if (!loader) return;
    loader.classList.contains("loader-hidden") ? ShowLoader() : HideLoader(true);
}

async function WithLoader(task) {
    ShowLoader();
    try {
        return await task();
    } finally {
        HideLoader();
    }
}

async function ApiRequest(url, options = {}) {
    const token = localStorage.getItem("token");
    const headers = new Headers(options.headers || {});

    if (token && !headers.has("Session-Id")) {
        headers.set("Session-Id", token);
    }

    if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, { ...options, headers });
    const rawText = await response.text();
    let payload = null;

    try {
        payload = rawText ? JSON.parse(rawText) : {};
    } catch (e) {
        throw new Error("Risposta del server non valida.");
    }

    if (!response.ok || payload.success === false) {
        throw new Error(payload.message || payload.error || `Errore server (${response.status})`);
    }

    return payload;
}

function ShowAlert(message, type = 'info') {
    const existingModal = document.getElementById('alert-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'alert-modal';
    modal.className = `alert-modal fade-in ${type}`;

    modal.innerHTML = `
        <div class="game-alert-content">
            <button class="cdanger-btn" aria-label="Cdanger">&times;</button>
            <div class="game-alert-message">${message}</div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('.cdanger-btn').onclick = () => {
        modal.classList.remove('fade-in');
        modal.classList.add('fade-out');
        modal.addEventListener('animationend', () => modal.remove());
    };

    setTimeout(() => {
        if (document.body.contains(modal)) {
            modal.classList.remove('fade-in');
            modal.classList.add('fade-out');
            modal.addEventListener('animationend', () => modal.remove());
        }
    }, 3000);
}
function SendRequest(method, url, parameters = {}, isFormData = false) {
    let processData = true;
    let contentType = "application/x-www-form-urlencoded;charset=utf-8";

    if (isFormData) {
        processData = false;
        contentType = false;
    }

    ShowLoader();

    return $.ajax({
        url: url,
        type: method,
        data: parameters,
        dataType: "json",
        timeout: 5000,
        processData: processData,
        contentType: contentType
    }).always(() => HideLoader());
}
function error(jqXHR) {
    if (jqXHR.status == 0)
        ShowAlert("server timeout","danger");
    else if (jqXHR.status == 200)
        ShowAlert("Formato dei dati non corretto : " + jqXHR.responseText,"danger");
    else
        ShowAlert("Server Error: " + jqXHR.status + " - " + jqXHR.responseText,"danger");
}
