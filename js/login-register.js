document.addEventListener('DOMContentLoaded', async () => {
    ShowHideLoader();

    try {
        const response = await fetch('api/game/levels.php');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
            const levels = data.data;
            const randomIndex = Math.floor(Math.random() * levels.length);

            $("body").css({
                "background": `linear-gradient(rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.8)), url('${levels[randomIndex].ImagePath}') no-repeat center center fixed`,
                "background-size": "cover"
            });    
        }
    } catch (e) {
        console.error("Errore nel caricamento dei livelli per lo sfondo:", e);
    }

    $("#toggle-password").on("change", ShowHidePassword);
});

function ShowHidePassword() {
    const input = $("#password-input");
    const isChecked = $(this).is(":checked");

    if (isChecked) {
        input.attr("type", "text");
    } else {
        input.attr("type", "password");
    }
}
