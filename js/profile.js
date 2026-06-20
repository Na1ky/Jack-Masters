const apiKey = "350edb9f05085e05a6639a93b38f5b6e";
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(window.location.search);
    const viewedUsername = params.get('Username');

    if (!token && !viewedUsername) {
        window.location.href = "login.html";
        return;
    }

    try {
        const profileUrl = viewedUsername
            ? `api/user/profile.php?Username=${encodeURIComponent(viewedUsername)}`
            : 'api/user/profile.php';
        const result = await WithLoader(() => ApiRequest(profileUrl));
        
        if (result.success && result.data) {
            const player = result.data;
            const isOwnProfile = !viewedUsername;
            
            document.getElementById('profile-title').textContent = "Profilo Giocatore: " + player.Username;
            document.getElementById('card-username-title').innerHTML = `<i class="bi bi-person-circle"></i> ` + player.Username;
            
            if (player.Name) document.getElementById('view-nome').textContent = player.Name;
            if (player.Surname) document.getElementById('view-cognome').textContent = player.Surname;
            document.getElementById('view-fiches').textContent = Number(player.Fiches).toLocaleString();
            document.getElementById('view-current-lvl').textContent = player.Lvl || "0";
            document.getElementById('view-top-lvl').textContent = player.TopLevel || "0";
            
            const profileImg = document.getElementById('profile-image');
            profileImg.src = player.Image || "img/default.png";
            document.getElementById('image-settings').dataset.player = player.Username;
            document.getElementById('image-settings').classList.toggle('editable', isOwnProfile);
            document.getElementById('file-input').disabled = !isOwnProfile;
            const editIcon = document.querySelector('.edit-icon');
            if (editIcon && !isOwnProfile) editIcon.remove();

            document.getElementById('total-win').textContent = `Vittorie: ${player.TotalWins || 0}`;
            document.getElementById('total-lose').textContent = `Perse: ${player.TotalLosses || 0}`;
            InitializeTable(player.Games || []);
        }
    } catch (e) {
        console.error("Errore fetch profile:", e);
        if (typeof ShowAlert === 'function') ShowAlert(e.message || "Errore nel caricamento del profilo", "danger");
        InitializeTable([]);
    }

    const profileImage = $("#profile-image");
    const fileInput = $('#file-input');

    profileImage.on('click', () => {
        if (viewedUsername) return;
        fileInput.trigger('click');
    });

    fileInput.on('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            resizeImage(file, 800, 800, (resizedDataUrl) => {
                $('#profile-image').attr('src', resizedDataUrl);
                $("#navbarAvatar").attr("src", resizedDataUrl)
                const base64String = resizedDataUrl.split(',')[1];
                const formData = new FormData();
                formData.append('image', base64String);
    
                const apiUrl = `https://api.imgbb.com/1/upload?key=${apiKey}`;
    
                SendRequest("POST", apiUrl, formData, true)
                    .done(response => {
                        if (response.success) {
                            WithLoader(() => ApiRequest("api/user/profile_image.php", {
                                method: "POST",
                                body: JSON.stringify({ newImage: response.data.url })
                            })).then(() => {
                                ShowAlert("Immagine aggiornata con successo!");
                            }).catch(error => {
                                console.error(error);
                                ShowAlert(error.message || "Errore durante l'aggiornamento dell'immagine", "danger");
                            });
                        } else {
                            console.error('Errore upload:', response);
                        }
                    })
                    .fail(error => console.error(error));
            });
        }
    });    
});

function InitializeTable(gamesData){
    $('#games-table').DataTable({
        responsive: true,
        data: gamesData,
        columns: [
            { data: 'Date', title: 'Data', defaultContent: '' },
            { data: 'Results', title: 'Esito', defaultContent: '' },
            { data: 'Wins', title: 'Vittorie', defaultContent: '0' },
            { data: 'Loses', title: 'Perse', defaultContent: '0' },
            { data: 'Draw', title: 'Pareggi', defaultContent: '0' }
        ],
        order: [[0, 'desc']],
        pageLength: 5,
        language: {
            search: "Cerca:",
            lengthMenu: "Mostra _MENU_ sessioni",
            zeroRecords: "Ancora nessuna sessione",
            info: "Pagina _PAGE_ di _PAGES_",
            infoEmpty: "Nessuna sessione disponibile",
            infoFiltered: "(filtrati da _MAX_ sessioni totali)",
            paginate: {
                first: "Prima",
                last: "Ultima",
                next: "Succ",
                previous: "Prec"
            }
        }
    });
}

function resizeImage(file, maxWidth, maxHeight, callback) {
    const reader = new FileReader();

    reader.onerror = () => {
        ShowAlert("Errore nella lettura del file","danger");
        callback(null);
    };

    reader.onload = function(e) {
        const img = new Image();

        img.onerror = () => {
            ShowAlert("Errore nel caricamento dell'immagine","danger");
            callback(null);
        };

        img.onload = function() {
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');

            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = height * (maxWidth / width);
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = width * (maxHeight / height);
                height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

            canvas = null;

            callback(dataUrl);
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}
