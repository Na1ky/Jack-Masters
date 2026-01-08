function ShowHideLoader() {
    const loader = document.querySelector(".loader");
    if (loader.classList.contains("loader-hidden")) {
        loader.classList.remove("loader-hidden");
    }
    else
        loader.classList.add("loader-hidden");
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

    return $.ajax({
        url: url,
        type: method,
        data: parameters,
        dataType: "json",
        timeout: 5000,
        processData: processData,
        contentType: contentType
    });
}
function error(jqXHR) {
    if (jqXHR.status == 0)
        ShowAlert("server timeout","danger");
    else if (jqXHR.status == 200)
        ShowAlert("Formato dei dati non corretto : " + jqXHR.responseText,"danger");
    else
        ShowAlert("Server Error: " + jqXHR.status + " - " + jqXHR.responseText,"danger");
}