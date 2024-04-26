document.addEventListener("DOMContentLoaded", function () {
  function loadImmobile() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");

    if (!id) {
      displayError("ID not found in URL");
      return;
    }
    fetch(`http://localhost:3000/api/immobili?id=${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch immobile");
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          renderPage(data.immobile);
        } else {
          displayError(data.message);
        }
      })
      .catch((error) => {
        console.error("Error loading immobile:", error);
        displayError("404 - Immobile not found !");
      });
  }

  // Function to render the page with immobile information
  function renderPage(immobile) {
    document.querySelector(".sp-image img").src = immobile.immagini[0];
    document.querySelector("#item-titolo").textContent = immobile.titolo;
    document.querySelector("#item-indirizzo").textContent = immobile.indirizzo;
    document.querySelector("#item-prezzo").textContent = parseFloat(
      immobile.prezzo
    ).toLocaleString("it-IT", {
      style: "currency",
      currency: "EUR",
    });
    document.querySelector(
      "#locali"
    ).textContent = `${immobile.num_locali} Locali`;
    document.querySelector(
      "#bagni"
    ).textContent = `${immobile.num_bagni} Bagni`;
    if (immobile.garage == "true") {
      document.querySelector("#garage").textContent = "Garage";
    } else {
      document.querySelector("#garage").remove();
    }

    if (immobile.giardino == "true") {
      document.querySelector("#giardino").textContent = "Giardino";
    } else {
      document.querySelector("#giardino").remove();
    }
    document.querySelector("#item-descrizione").textContent =
      immobile.descrizione;
  }

  function displayError(message) {
    document.querySelector(
      ".single-property-section"
    ).innerHTML = `<div class="text-center"><h1>${message}</h1></div>`;
  }
  loadImmobile();
});
