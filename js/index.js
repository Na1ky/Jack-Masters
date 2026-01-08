$(() => {
    ShowHideLoader();

    const thumbnails = document.querySelectorAll(".level-thumbnails .thumb-wrapper");
    const mainImage = document.getElementById("main-level-image");
    const mainName = document.getElementById("main-level-name");
    const mainDesc = document.getElementById("main-level-desc");
    const mainFichesP = document.querySelector("#level-display p strong").parentNode;

    function updateMainDisplay(thumb) {
        const img = thumb.querySelector("img");
        mainImage.src = img.src;
        mainImage.alt = img.alt;

        mainName.textContent = thumb.dataset.name;
        mainDesc.textContent = thumb.dataset.desc;
        mainFichesP.innerHTML = `<strong>Fiches richieste:</strong> ${Number(thumb.dataset.fiches).toLocaleString()}`;
    }

    thumbnails.forEach(thumb => {
        thumb.addEventListener("click", () => {
            updateMainDisplay(thumb);

            thumbnails.forEach(t => {
                t.style.opacity = "0.5";
                t.querySelector("img").style.borderColor = "transparent";
            });

            thumb.style.opacity = "1";
            thumb.querySelector("img").style.borderColor = "#0d6efd";
        });
    });

    if (thumbnails.length > 0) {
        thumbnails.forEach(t => {
            t.style.opacity = "0.5";
            t.querySelector("img").style.borderColor = "transparent";
        });
        thumbnails[0].style.opacity = "1";
        thumbnails[0].querySelector("img").style.borderColor = "#0d6efd";
    }
});
