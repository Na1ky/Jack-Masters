document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await WithLoader(() => ApiRequest('api/game/levels.php'));
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
    const isChecked = $(this).is(":checked");
    $(".js-password-field, #password-input").attr("type", isChecked ? "text" : "password");
}
