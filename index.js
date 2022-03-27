/* Připojení modulu frameworku Express */
const express = require("express");

/* Vytvoření základního objektu serverové aplikace */
const app = express();
/* Nastavení portu, na němž bude spuštěný server naslouchat */
const port = 3000;

/* Spuštění webového serveru */
app.listen(port, () => {
    console.log(`Server naslouchá na portu ${port}`);
});