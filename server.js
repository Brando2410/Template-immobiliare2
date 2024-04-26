const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const app = express();
const port = 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/img/property");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.originalname.split(".")[0] +
        "-" +
        Date.now().toString().slice(-8) +
        "." +
        file.mimetype.split("/")[1]
    );
  },
});
const upload = multer({ storage: storage });

// Routes
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.get("/gestione_immobili", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "msnage-area.html"));
});

const passwordFilePath = path.join(__dirname, "pwd.txt");
const immobiliFilePath = path.join(__dirname, "immobili.json");
const immobiliEvidenzaFilePath = path.join(__dirname, "immobili_evidenza.json");

// API
function verificaPassword(password) {
  const savedPassword = fs.readFileSync(passwordFilePath, "utf8").trim();
  return password === savedPassword;
}

app.post("/api/verifica-password", (req, res) => {
  const { password } = req.body;

  if (verificaPassword(password)) {
    res.json({ success: true, message: "Password corretta." });
  } else {
    res.json({ success: false, message: "Password errata." });
  }
});

app.put("/api/cambia-password", (req, res) => {
  const { password, newPassword } = req.body;
  if (!verificaPassword(password)) {
    return res.json({ success: false, message: "Password errata." });
  }

  fs.writeFileSync(passwordFilePath, newPassword);

  res.json({ success: true, message: "Password cambiata con successo." });
});

function loadImmobiliFromFile() {
  try {
    if (!fs.existsSync(immobiliFilePath)) {
      return [];
    }

    const fileContent = fs.readFileSync(immobiliFilePath, "utf8");
    if (fileContent.trim() === "") {
      return [];
    }

    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error loading immobili from file:", error);
    return [];
  }
}
function addImageUrl(immobile) {
  if (immobile.immagini && immobile.immagini.length > 0) {
    const immaginiURLs = immobile.immagini.map((imagePath) => {
      return `http://localhost:${port}/${imagePath}`;
    });
    return { ...immobile, immagini: immaginiURLs };
  } else {
    return immobile;
  }
}

app.post("/api/aggiungi-immobile", upload.array("immagini"), (req, res) => {
  const {
    password,
    titolo,
    prezzo,
    affitto,
    vendita,
    garage,
    giardino,
    descrizione,
    indirizzo,
    anno_costruzione,
    metratura,
    num_bagni,
    num_locali,
  } = req.body;
  if (!verificaPassword(password)) {
    return res.json({ success: false, message: "Password errata." });
  }

  let immobili = loadImmobiliFromFile();
  const id = Date.now().toString().slice(-8);
  const immagini = req.files.map((file) => file.path.replace("public\\", ""));
  const immobile = {
    id,
    titolo,
    prezzo,
    affitto,
    vendita,
    descrizione,
    indirizzo,
    anno_costruzione,
    metratura,
    num_bagni,
    num_locali,
    garage,
    giardino,
    immagini: immagini,
    evidenza: false,
  };
  immobili.push(immobile);
  fs.writeFileSync(immobiliFilePath, JSON.stringify(immobili, null, 2));
  res.json({ success: true, message: "Immobile aggiunto con successo.", id });
});

app.post("/api/evidenza", (req, res) => {
  const { password, id } = req.body;
  if (!verificaPassword(password)) {
    return res.json({ success: false, message: "Password errata." });
  }

  let immobili = loadImmobiliFromFile();
  let immobili_evidenza = [];
  immobili = immobili.map((immobile) => {
    if (immobile.id === id) {
      immobile.evidenza = !immobile.evidenza;
    }
    if (immobile.evidenza) {
      immobili_evidenza.push(immobile);
    }
    return immobile;
  });
  fs.writeFileSync(immobiliFilePath, JSON.stringify(immobili, null, 2));
  fs.writeFileSync(
    immobiliEvidenzaFilePath,
    JSON.stringify(immobili_evidenza, null, 2)
  );
  res.json({ success: true, message: "Immobile evidenziato con successo." });
});

app.delete("/api/rimuovi-immobile", (req, res) => {
  const { password, id } = req.body;
  if (!verificaPassword(password)) {
    return res.json({ success: false, message: "Password errata." });
  }

  let immobili = loadImmobiliFromFile();
  immobili = immobili.filter((immobile) => immobile.id != id);
  fs.writeFileSync(immobiliFilePath, JSON.stringify(immobili, null, 2));
  res.json({ success: true, message: "Immobile rimosso con successo." });
});

app.post("/api/immobili", (req, res) => {
  const { id } = req.query;
  const immobili = loadImmobiliFromFile();

  if (id) {
    const immobile = immobili.find((immobile) => immobile.id === id);
    if (immobile) {
      const immobileWithImages = addImageUrl(immobile);
      return res.json({ success: true, immobile: immobileWithImages });
    } else {
      res.json({ success: false, message: "Immobile non trovato." });
    }
  } else {
    const immobiliWithImages = immobili.map(addImageUrl);
    return res.json({ success: true, immobili: immobiliWithImages });
  }
});

app.get("/api/immobili-evidenza", (req, res) => {
  const immobili_evidenza = JSON.parse(
    fs.readFileSync(immobiliEvidenzaFilePath, "utf8")
  );
  const immobiliWithImages = immobili_evidenza.map(addImageUrl);
  res.json({ success: true, immobili: immobiliWithImages });
});

app.post("/api/valuta-immobile", (req, res) => {
  const { name, email, subject, message } = req.body;
  const valutazione = {
    name,
    email,
    subject,
    message,
    date: new Date().toISOString(),
    id: Date.now().toString().slice(-8),
  };

  const valutazioniFilePath = path.join(__dirname, "valutazioni.json");

  fs.readFile(valutazioniFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading valutazioni file:", err);
      return res.status(500).send("Internal Server Error");
    }
    let valutazioni = [];
    try {
      valutazioni = JSON.parse(data);
      valutazioni.push(valutazione);
    } catch (parseError) {
      console.error("Error parsing valutazioni file:", parseError);
      return res.status(500).send("Internal Server Error");
    }

    fs.writeFile(
      valutazioniFilePath,
      JSON.stringify(valutazioni, null, 2),
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing valutazioni file:", writeErr);
          return res.status(500).send("Internal Server Error");
        }
        res.json({
          success: true,
          message: "Messaggio inviato con successo.",
        });
      }
    );
  });
});

app.post("/api/valutazioni", (req, res) => {
  const valutazioniFilePath = path.join(__dirname, "valutazioni.json");

  fs.readFile(valutazioniFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading valutazioni file:", err);
      return res.status(500).send("Internal Server Error");
    }

    let valutazioni = [];
    try {
      valutazioni = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing valutazioni file:", parseError);
      return res.status(500).send("Internal Server Error");
    }

    res.json({ success: true, valutazioni });
  });
});

app.delete("/api/rimuovi-valutazione", (req, res) => {
  const { id, password } = req.body;
  if (!verificaPassword(password)) {
    return res.json({ success: false, message: "Password errata." });
  }
  const valutazioniFilePath = path.join(__dirname, "valutazioni.json");

  fs.readFile(valutazioniFilePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading valutazioni file:", err);
      return res.status(500).send("Internal Server Error");
    }

    let valutazioni = [];
    try {
      valutazioni = JSON.parse(data);
      valutazioni = valutazioni.filter((valutazione) => valutazione.id != id);
    } catch (parseError) {
      console.error("Error parsing valutazioni file:", parseError);
      return res.status(500).send("Internal Server Error");
    }

    fs.writeFile(
      valutazioniFilePath,
      JSON.stringify(valutazioni, null, 2),
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing valutazioni file:", writeErr);
          return res.status(500).send("Internal Server Error");
        }
        res.json({
          success: true,
          message: "Valutazione rimossa con successo.",
        });
      }
    );
  });
});

/* OLD EMAIL API
app.post("/api/newsletter", (req, res) => {
  const { name, email, subject, message } = req.query;
  const { email: userEmail, password: userPassword } = getEmailandPwd();
  const nodemailer = require("nodemailer");
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    secureConnection: false,
    port: 587,
    auth: {
      user: `${userEmail}`,
      pass: `${userPassword}`,
    },
  });
  const mailOptions = {
    from: `<${userEmail}>`,
    to: `${email}`,
    subject: subject,
    text: `Messaggio da ${name} (${email}): ${message}`,
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.json({ success: false, message: "Errore nell'invio della mail." });
    } else {
      res.json({ success: true, message: "Mail inviata con successo." });
    }
  });
});

app.post("/api/change-email", (req, res) => {
  const { password, emailPassword, email } = req.body;
  if (!verificaPassword(password)) {
    return res.json({ success: false, message: "Password errata." });
  }
  fs.writeFileSync("email.txt", "");
  fs.writeFileSync("email.txt", email + "\n" + emailPassword);
  res.json({ success: true, message: "Email saved successfully." });
});

function getEmailandPwd() {
  try {
    if (!fs.existsSync("email.txt")) {
      return [];
    }

    const fileContent = fs.readFileSync("email.txt", "utf8");
    if (fileContent.trim() === "") {
      return [];
    }

    const [email, password] = fileContent.split("\n");
    return { email, password };
  } catch (error) {
    console.error("Error loading email and password from file:", error);
    return [];
  }
} 
*/

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
