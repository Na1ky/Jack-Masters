$(() => {
    ShowHideLoader();

    const levels = JSON.parse(document.querySelector('main').dataset.levels);
    const randomIndex = Math.floor(Math.random() * levels.length);

    $("body").css({
        "background": `linear-gradient(rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.8)), url('${levels[randomIndex].ImagePath}') no-repeat center center fixed`,
        "background-size": "cover"
    });    

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
