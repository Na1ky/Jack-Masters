$(() => {
    ShowHideLoader();
    const table = $('#players-table').DataTable({
        "responsive": true,
        "ajax": "php/get_players.php",
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

    setInterval(() => {
        table.ajax.reload(null, false);
    }, 30000);

    table.on('click', 'tbody tr', function () {
        let data = table.row(this).data();
        let params = new URLSearchParams({
            Username: data[1]
        })
        window.location.href="profile.php?" + params;
    });
})