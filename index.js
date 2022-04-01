/* Připojení modulu frameworku Express (https://expressjs.com/) */
const express = require("express");
/* Připojení externího modulu body-parser (https://www.npmjs.com/package/body-parser) - middleware pro parsování těla požadavku */
const bodyParser = require("body-parser");
/* Připojení externího modulu moment (https://momentjs.com/) - knihovna pro formátování datových a časových údajů */
const moment = require("moment");
/* Připojení externího modulu csvtojson (https://www.npmjs.com/package/csvtojson) - knihovna usnadňující načtení dat z CSV do formátu JSON */
const csvtojson = require('csvtojson');
/* Připojení vestavěných  modulů fs (práce se soubory) a path (cesty v adresářové struktuře) */
const fs = require("fs");
const path = require("path");

/* Vytvoření základního objektu serverové aplikace */
const app = express();
/* Nastavení portu, na němž bude spuštěný server naslouchat */
const port = 3000;

/* Identifikace složky obsahující statické soubory klientské části webu */
app.use(express.static("public"));
/* Nastavení typu šablonovacího engine na pug*/
app.set("view engine", "pug");
/* Nastavení složky, kde budou umístěny šablony pug */
app.set("views", path.join(__dirname, "views"));

/* Využití modulu body-parser pro parsování těla požadavku */
const urlencodedParser = bodyParser.urlencoded({extended: false});
/* Ošetření požadavku poslaného metodou POST na adresu <server>/savedata
   Ukládá data poslaná z webového formuláře do souboru CSV */
app.post('/savedata', urlencodedParser, (req, res) => {
    /* Do proměnné date bude pomocí knihovny MomentJS uloženo aktuální datum v podobě YYYY-MM-DD (rok-měsíc-den) */
    let date = moment().format('YYYY-MM-DD');
    /* Vytvoření řetězce z dat odeslaných z formuláře v těle požadavku (req.body) a obsahu proměnné date.
       Data jsou obalena uvozovkami a oddělená čárkou. Escape sekvence \n provede ukončení řádku. */
    let str = `"${req.body.ukol}","${req.body.predmet}","${date}","${req.body.odevzdani}"\n`;
    /* Pomocí modulu fs a metody appendFile dojde k přidání připraveného řádku (proměnná str) do uvedeného souboru */
    fs.appendFile(path.join(__dirname, 'data/ukoly.csv'), str, function (err) {
        /* Když byla zaznamenána chyba při práci se souborem */
        if (err) {
            /* Vypsání chyby do konzole NodeJS (na serveru). */
            console.error(err);
            /* Odpovědí serveru bude stavová zpráva 400 a v hlavičce odpovědi budou odeslány upřesňující informace. */
            return res.status(400).json({
                success: false,
                message: "Nastala chyba během ukládání souboru"
            });
        }
    });
    /* Přesměrování na úvodní stránku serverové aplikace včetně odeslání stavové zprávy 301. */
    res.redirect(301, '/');
});

/* Reakce na požadavek odeslaný metodou get na adresu <server>/todolist */
app.get("/todolist", (req, res) => {
    /* Použití knihovny csvtojson k načtení dat ze souboru ukoly.csv. 
       Atribut headers zjednodušuje pojmenování jednotlivých datových sloupců. */
    /* Pro zpracování je použito tzv. promises, které pracují s částí .then (úspěšný průběh operace) a .catch (zachycení možných chyb) */   
    csvtojson({headers:['ukol','predmet','zadani','odevzdani']}).fromFile(path.join(__dirname, 'data/ukoly.csv'))
    .then(data => {
        /* Vypsání získaných dat ve formátu JSON do konzole */
        console.log(data);
        /* Možnost seřazení dat podle sloupce odevzdani - vzestupně */
        data.sort(function(a, b) { 
            if (a.odevzdani > b.odevzdani) return 1
            else if (a.odevzdani < b.odevzdani) return -1
            else return 0; 
        })
        /* Vykreslení šablony index.pug i s předanými daty (objekt v druhém parametru) */
        res.render('index', {nadpis: "Seznam úkolů", ukoly: data});
    })
    .catch(err => {
        /* Vypsání případné chyby do konzole */
        console.log(err);
        /* Vykreslení šablony error.pug s předanými údaji o chybě */
        res.render('error', {nadpis: "Chyba v aplikaci", chyba: err});
    });    
});

/* Spuštění webového serveru */
app.listen(port, () => {
    console.log(`Server naslouchá na portu ${port}`);
});