var properties = [];
window.onload = function () {
  fetch("http://localhost:3000/api/immobili", {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      properties = data.immobili;
      displayProperties(1, 4);
    })
    .catch((error) => {
      console.error("Error fetching properties:", error);
    });
};

function displayProperties(pageNumber, pageSize) {
  var startIndex = (pageNumber - 1) * pageSize;
  var endIndex = Math.min(startIndex + pageSize, properties.length);

  $("#properties-container")
    .empty()
    .append('<div class="loader-container"><div class="loader"></div></div>');
  $("#pagination-container").empty();

  setTimeout(function () {
    $(".loader-container").remove();

    for (var i = startIndex; i < endIndex; i++) {
      var property = properties[i];

      property.prezzo = parseFloat(property.prezzo).toLocaleString("it-IT", {
        style: "currency",
        currency: "EUR",
      });

      var propertyHtml = `
      <div class="col-lg-6" style="margin-bottom: 30px">
        <div class="immobili-box" data-property-id="${property.id}" style="border: 1px solid rgba(0, 0, 0, 0.6);">
          <div class="image-container">
            <img src="${property.immagini[0]}" alt="property_img" />
            <div class="overlay">
              <div class="title">${property.titolo}</div>
              <div class="price">${property.prezzo}</div>
              <div class="icons-container">
                <div class="icon-container">
                  <img class="icon-shower" src="../img/icons/icon-shower.png" style="width: 28px; height: 28px" />
                  <span>2</span>
                </div>
                <div class="icon-container">
                  <img class="icon-bed" src="../img/icons/icon-bed.png" style="width: 28px; height: 28px" />
                  <span>2</span>
                </div>
                <div class="icon-container">
                  <img class="icon-mq" src="../img/icons/icon-mq.png" style="width: 28px; height: 28px" />
                  <span>200 mq</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`;

      $("#properties-container").append(propertyHtml);
    }

    var totalPages = Math.ceil(properties.length / pageSize);
    for (var i = 1; i <= totalPages; i++) {
      var activeClass = i === pageNumber ? "active" : "";
      var pageLinkHtml = `<li class="page-item ${activeClass}"><a class="page-link" href="#" onclick="displayProperties(${i}, ${pageSize})">${i}</a></li>`;
      $("#pagination-container").append(pageLinkHtml);
    }
  }, 600);
}

$(document).on("click", ".immobili-box", function () {
  var propertyId = $(this).data("property-id");
  window.location.href = `single-property.html?id=${propertyId}`;
});
