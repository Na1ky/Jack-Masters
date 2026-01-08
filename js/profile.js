const apiKey = "350edb9f05085e05a6639a93b38f5b6e";
$(() => {
    ShowHideLoader();
    
    const btnEdit = $('#btn-edit');
    const btnCancel = $('#btn-cancel');
    const profileView = $('#profile-view');
    const profileEdit = $('#profile-edit');
    const profileImage = $("#profile-image");
    const fileInput = $('#file-input');
    const gamesData = JSON.parse($('#games-table').attr('data-games'));
    InitializeTable(gamesData);

    profileImage.on('click', () => {
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
                            const username = $('#image-settings').attr('data-player');
                            SendRequest("POST","php/update_profile_image.php", {newImage: response.data.url, user: username})
                            .done(() => {
                                ShowAlert("Immagine aggiornata con successo!");
                            }).fail(error);
                        } else {
                            console.error('Errore upload:', response);
                        }
                    })
                    .fail(error);
            });
        }
    });    

    btnEdit.on('click', () => {
        profileView.hide();
        profileEdit.show();
    });

    btnCancel.on('click', () => {
        profileEdit.hide();
        profileView.show();
    });
});

function InitializeTable(gamesData){
    $('#games-table').DataTable({
        responsive: true,
        data: gamesData,
        columns: [
            { data: 'Date', title: 'Data' },
            { data: 'Results', title: 'Esito' },
            { data: 'Wins', title: 'Vittorie' },
            { data: 'Loses', title: 'Perse' },
            { data: 'Draw', title: 'Pareggi' }
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