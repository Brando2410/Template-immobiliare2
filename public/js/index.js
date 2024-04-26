document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/immobili-evidenza", {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const immobili = data.immobili;
      immobili.forEach((item) => {
        const title = item.titolo;
        const price = parseFloat(item.prezzo).toLocaleString("it-IT", {
          style: "currency",
          currency: "EUR",
        });
        const description = item.descrizione;
        const bagni = item.num_bagni;
        const locali = item.num_locali;
        const mq = item.metratura + " mq";

        item.immagini.forEach((imageUrl) => {
          const imgContainer = document.createElement("div");
          imgContainer.classList.add("center");
          imgContainer.style.position = "relative";

          const img = document.createElement("img");
          img.style.maxWidth = "100%";
          img.style.width = "auto";
          img.style.height = "300px";
          img.style.padding = "1px";
          img.style.borderRadius = "4px";
          img.src = imageUrl;
          img.alt = "immobile";

          const overlay = document.createElement("div");
          overlay.classList.add("overlay");

          const titleElement = document.createElement("div");
          titleElement.classList.add("title");
          titleElement.textContent = title;

          const priceElement = document.createElement("div");
          priceElement.classList.add("price");
          priceElement.textContent = price;

          const iconsContainer = document.createElement("div");
          iconsContainer.classList.add("icons-container");

          const showerContainer = document.createElement("div");
          showerContainer.classList.add("icon-container");

          const showerIcon = document.createElement("img");
          showerIcon.classList.add("icon-shower");
          showerIcon.src = "../img/icons/icon-shower.png";
          showerIcon.style.width = "28px";
          showerIcon.style.height = "28px";
          showerContainer.appendChild(showerIcon);

          const showerText = document.createElement("span");
          showerText.textContent = bagni;

          iconsContainer.appendChild(showerContainer);
          showerContainer.appendChild(showerText);

          const bedContainer = document.createElement("div");
          bedContainer.classList.add("icon-container");

          const bedIcon = document.createElement("img");
          bedIcon.classList.add("icon-bed");
          bedIcon.src = "../img/icons/icon-bed.png";
          bedIcon.style.width = "28px";
          bedIcon.style.height = "28px";
          bedContainer.appendChild(bedIcon);

          const bedText = document.createElement("span");
          bedText.textContent = locali;

          iconsContainer.appendChild(bedContainer);
          bedContainer.appendChild(bedText);

          // Create img element for square meters icon
          const mqContainer = document.createElement("div");
          mqContainer.classList.add("icon-container");

          const mqIcon = document.createElement("img");
          mqIcon.classList.add("icon-mq");
          mqIcon.src = "../img/icons/icon-mq.png";
          mqIcon.style.width = "28px";
          mqIcon.style.height = "28px";
          mqContainer.appendChild(mqIcon);

          const mqText = document.createElement("span");
          mqText.textContent = mq;

          iconsContainer.appendChild(mqContainer);
          mqContainer.appendChild(mqText);

          // Append elements to overlay
          overlay.appendChild(titleElement);
          overlay.appendChild(priceElement);
          overlay.appendChild(iconsContainer);
          imgContainer.appendChild(overlay);
          imgContainer.appendChild(img);
          imgContainer.setAttribute("data-property-id", item.id);
          imgContainer.classList.add("imgContainer");
          1;
          document.querySelector("#property-row").appendChild(imgContainer);
        });
      });

      $("#property-row").slick({
        arrows: true,
        autoplay: true,
        autoplaySpeed: 3500,
        adaptiveHeight: true,
        centerPadding: "50px",
        dots: true,
        pauseOnHover: true,
        pouseOnFocus: true,
        slidesToShow: 2,
        centerMode: true,
        variableWidth: true,

        responsive: [
          {
            breakpoint: 1200,
            settings: {
              arrows: false,
              autoplay: true,
              autoplaySpeed: 2000,
              adaptiveHeight: true,
              centerPadding: "40px",
              pauseOnHover: true,
              pouseOnFocus: true,
              dots: true,
              slidesFotRow: 2,
              slidesToShow: 2,
            },
          },
          {
            breakpoint: 980,
            settings: {
              arrows: false,
              autoplay: true,
              pauseOnHover: true,
              pouseOnFocus: true,
              autoplaySpeed: 2000,
              adaptiveHeight: true,
              centerPadding: "40px",
              slidesToShow: 1,
              slidesForScroll: 1,
            },
          },
        ],
      });
    })
    .catch((error) => {
      console.error("Error fetching data from API:", error);
    });
});

$(document).on("click", ".imgContainer", function () {
  var propertyId = $(this).data("property-id");
  window.location.href = `single-property.html?id=${propertyId}`;
});
