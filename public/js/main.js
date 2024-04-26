$(window).on("load", function () {
  /*------------------
        Preloder
    --------------------*/
  $(".loader").fadeOut();
  $("#preloder").delay(400).fadeOut("slow");
});

(function ($) {
  /*------------------
        Navigation
    --------------------*/
  $(".main-menu").slicknav({
    appendTo: ".header-section",
    allowParentLinks: true,
    closedSymbol: '<i class="fa fa-angle-right"></i>',
    openedSymbol: '<i class="fa fa-angle-down"></i>',
  });

  $(".slicknav_nav").prepend('<li class="header-right-warp"></li>');
  $(".header-right").clone().prependTo(".slicknav_nav > .header-right-warp");

  /*------------------
        Background Set
    --------------------*/
  $(".set-bg").each(function () {
    var bg = $(this).data("setbg");
    $(this).css("background-image", "url(" + bg + ")");
  });
})(jQuery);

// contact form
function sendEmail(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;
  if (!name || !email || !subject || !message) {
    alert("Completa tutti i campi del form per inviare la richiesta");
    return;
  }

  const data = {
    name: name,
    email: email,
    subject: subject,
    message: message,
  };

  fetch("/api/valuta-immobile", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        alert(data.message);
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";
        document.getElementById("subject").value = "";
        document.getElementById("message").value = "";
      } else {
        alert("Errore nell'invio della mail.", data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Errore nell'invio della mail.");
    });
}
