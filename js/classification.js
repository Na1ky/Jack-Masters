document.addEventListener('DOMContentLoaded', async () => {
    const tbody = document.getElementById('players-tbody');

    try {
        const data = await WithLoader(() => ApiRequest('api/game/classification.php'));
        
        if (data.success && data.data) {
            tbody.innerHTML = '';
            
            // Expected players fields from DB: Posizione, Username, Fiches, CurrentTable, TopTable, Image
            // If the structure is an array of objects
            data.data.forEach((player, index) => {
                // If the API doesn't return position, we can use index + 1
                const position = index + 1;
                // If it's an array of array like [1, 'User', 1000, 'Table 1', 'Table 2', '<img ...>'] we handle that, 
                // but let's assume it's array of objects or handle both
                let username, fiches, currentTable, topTable, avatar;
                if (Array.isArray(player)) {
                    // DataTables format
                    username = player[1];
                    fiches = player[2];
                    currentTable = player[3];
                    topTable = player[4];
                    avatar = player[5];
                } else {
                    username = player.Username || '';
                    fiches = player.Fiches || 0;
                    currentTable = player.CurrentTable || player.Lvl || 0;
                    topTable = player.TopTable || player.TopLevel || 0;
                    avatar = `<img src="${player.Image || 'img/default.png'}" alt="Avatar" width="40" height="40" style="border-radius:50%; object-fit:cover;">`;
                }

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${position}</td>
                    <td>${username}</td>
                    <td>${fiches}</td>
                    <td>${currentTable}</td>
                    <td>${topTable}</td>
                    <td>${avatar}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error("Error fetching classification:", e);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center text-warning py-4">
                        Impossibile caricare la classifica. Riprova tra poco.
                    </td>
                </tr>
            `;
        }
        if (typeof ShowAlert === 'function') {
            ShowAlert(e.message || "Errore nel caricamento della classifica", "danger");
        }
    }

    const table = $('#players-table').DataTable({
        "responsive": true,
        "pageLength": 10,
        "language": {
            "search": "Cerca:",
            "lengthMenu": "Mostra _MENU_ giocatori",
            "zeroRecords": "Nessun giocatore trovato",
            "info": "Pagina _PAGE_ di _PAGES_",
            "infoEmpty": "Nessun giocatore disponibile",
            "infoFiltered": "(filtrati da _MAX_ giocatori totali)",
            "paginate": {
                "first": "Prima",
                "last": "Ultima",
                "next": "Succ",
                "previous": "Prec"
            }
        }
    });

    table.on('click', 'tbody tr', function () {
        let data = table.row(this).data();
        if (data) {
            let params = new URLSearchParams({
                Username: data[1]
            })
            window.location.href="profile.html?" + params;
        }
    });
});
