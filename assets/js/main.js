import { Squadra, Evento, renderTeams, renderDetails, hideDetails } from "../js/squadre.js";


const SPINNER = document.querySelector("#spinner");
const ERRORE = document.querySelector("#errore");
const CERCA = document.querySelector("#cerca");
const BOTTONE_CERCA = document.querySelector("#bottone-cerca");
const SQUADRE = document.querySelector("#squadre");

const API_URL = "https://www.thesportsdb.com/api/v1/json/123/";

//funzioni per gestire lo spinner
const showSpinner = () => {
    SPINNER.removeAttribute("hidden");
    ERRORE.setAttribute("hidden", "true");
};

const hideSpinner = () => {
    SPINNER.setAttribute("hidden", "true");
};


//messaggio di errore
const showError = (msg) => {
    ERRORE.textContent = msg;
    ERRORE.removeAttribute("hidden");
};



const getJSON = async (url, options) => {

    const response = await fetch(url, options);

    // gestione degli errorei
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
};

//funzione per gestire la ricerca dei team
const searchTeams = async (query) => {
    
    showSpinner();
    hideDetails();

    const url = new URL(`${API_URL}searchteams.php`);
    url.searchParams.set("t", query);

    try {
        const data = await getJSON(url);

        let teams = [];
        if (data.teams) {
            teams = data.teams.map((t) => {
                return new Squadra(t);
            });
        }

        renderTeams(teams);
    } catch (err) {
        showError("Impossibile completare la ricerca: " + err.message);
    } finally {
        hideSpinner();
    }
};

const loadDetails = async (id, name) => {
    showSpinner();

    const nextUrl = new URL(API_URL + "eventsnext.php");
    nextUrl.searchParams.set("id", id);

    const lastUrl = new URL(API_URL + "eventslast.php");
    lastUrl.searchParams.set("id", id);

    try {
        const nextData = await getJSON(nextUrl);
        const lastData = await getJSON(lastUrl);

        let nextEvents = [];
        if (nextData.events) {
            nextEvents = nextData.events.map((e) => {
                return new Evento(e);
            });
        }

        let lastEvents = [];
        if (lastData.results) {
            lastEvents = lastData.results.map((e) => {
                return new Evento(e);
            });
        }

        renderDetails(name, nextEvents, lastEvents);
        
    } catch (err) {
        showError("Impossibile caricare i dettagli: " + err.message);
    } finally {
        hideSpinner();
    }
};

BOTTONE_CERCA.addEventListener("click", () => {
    const query = CERCA.value.trim();

    if (query.length === 0) {
        showError("Inserisci il nome di una squadra.");
    } else {
        searchTeams(query);
    }
});

SQUADRE.addEventListener("click", (e) => {
    const card = e.target.closest("[data-id]");

    if (card) {
        loadDetails(card.dataset.id, card.dataset.name);
    }
});
