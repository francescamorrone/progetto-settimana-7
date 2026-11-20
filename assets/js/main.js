import { Squadra, Evento, renderTeams, renderDetails, hideDetails, clearTeams, addFavorite, removeFavorite, renderFavorites, initFavorites, renderEventModal, setFavoritesFilter } from "./squadre.js";

const SPINNER = document.querySelector("#spinner");
const ERRORE = document.querySelector("#errore");
const CERCA = document.querySelector("#cerca");
const BOTTONE_CERCA = document.querySelector("#bottone-cerca");
const SQUADRE = document.querySelector("#squadre");
const PREFERITE = document.querySelector("#preferite");
const DETTAGLI = document.querySelector("#dettagli-section");
const FILTRI = document.querySelector("#filtri");

const API_URL = "https://www.thesportsdb.com/api/v1/json/123/";


const DARK_MODE = document.querySelector("#dark-mode");
const BODY = document.querySelector("body");
const HEADER = document.querySelector("header");


const setTheme = (dark) => {
    BODY.classList.toggle("dark", dark);
    if (dark === true) {
        BODY.setAttribute("data-bs-theme", "dark");
    } else {
        BODY.setAttribute("data-bs-theme", "light");
    }
};

DARK_MODE.addEventListener("change", (e) => {
    setTheme(e.target.checked);
});

window.addEventListener("scroll", () => {
    if (window.scrollY > 160) {
        HEADER.classList.add("scrolled");
    } else if (window.scrollY < 10) {
        HEADER.classList.remove("scrolled");
    }
});



const showSpinner = () => {
    SPINNER.removeAttribute("hidden");
    ERRORE.setAttribute("hidden", "true");
};

const hideSpinner = () => {
    SPINNER.setAttribute("hidden", "true");
};

const showError = (msg) => {
    ERRORE.textContent = msg;
    ERRORE.removeAttribute("hidden");
};

let controller;
let detailsController;
let foundTeams = [];
let currentEvents = [];
let timeoutId;

const getJSON = async (url, options) => {

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
};

const searchTeams = async (query) => {

    if (controller) {
        controller.abort();
    }
    controller = new AbortController();
    const signal = controller.signal;

    showSpinner();
    hideDetails();

    const url = new URL(`${API_URL}searchteams.php`);
    url.searchParams.set("t", query);

    try {
        const data = await getJSON(url, { signal: signal });

        let teams = [];
        if (data.teams) {
            teams = data.teams.map((t) => {
                return new Squadra(t);
            });
        }

        foundTeams = teams;
        renderTeams(teams);
    } catch (err) {
        if (err.name !== "AbortError") {
            showError("Impossibile completare la ricerca: " + err.message);
        }
    } finally {
        if (!signal.aborted) {
            hideSpinner();
        }
    }
};

const loadDetails = async (id, name) => {

    if (detailsController) {
        detailsController.abort();
    }
    detailsController = new AbortController();
    const signal = detailsController.signal;

    showSpinner();

    const nextUrl = new URL(`${API_URL}eventsnext.php`);
    nextUrl.searchParams.set("id", id);

    const lastUrl = new URL(`${API_URL}eventslast.php`);
    lastUrl.searchParams.set("id", id);

    try {
        const nextData = await getJSON(nextUrl, { signal: signal });
        const lastData = await getJSON(lastUrl, { signal: signal });

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

        currentEvents = nextEvents.concat(lastEvents);

        renderDetails(name, nextEvents, lastEvents);

    } catch (err) {
        if (err.name !== "AbortError") {
            showError("Impossibile caricare i dettagli: " + err.message);
        }
    } finally {
        if (!signal.aborted) {
            hideSpinner();
        }
    }
};

CERCA.addEventListener("input", (e) => {
    const query = e.target.value.trim();

    clearTimeout(timeoutId);

    if (query.length < 3) {

        if (controller) {
            controller.abort();
        }

        if (detailsController) {
            detailsController.abort();
        }

        hideSpinner();
        ERRORE.setAttribute("hidden", "true");
        foundTeams = [];
        currentEvents = [];
        clearTeams();
        hideDetails();
    } else {

        timeoutId = setTimeout(() => {
            searchTeams(query);
        }, 400);
    }
});

BOTTONE_CERCA.addEventListener("click", () => {
    const query = CERCA.value.trim();

    clearTimeout(timeoutId);

    if (query.length === 0) {
        showError("Inserisci il nome di una squadra");
    } else {
        searchTeams(query);
    }
});

SQUADRE.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-action]");
    const card = e.target.closest("[data-id]");

    if (button) {
        const team = foundTeams.find((t) => {
            return t.id === card.dataset.id;
        });

        if (team) {
            addFavorite(team);
        }

    } else if (card) {
        loadDetails(card.dataset.id, card.dataset.name);
    }
});

PREFERITE.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-action]");
    const card = e.target.closest("[data-id]");

    if (button) {

        if (button.dataset.action === "remove") {
            removeFavorite(card.dataset.id);
        }

    } else if (card) {
        loadDetails(card.dataset.id, card.dataset.name);
    }
});

DETTAGLI.addEventListener("click", (e) => {
    const item = e.target.closest("li[data-id]");

    if (item) {
        const evento = currentEvents.find((ev) => {
            return ev.id === item.dataset.id;
        });

        if (evento) {
            renderEventModal(evento);
        }
    }
});

FILTRI.addEventListener("click", (e) => {
    const button = e.target.closest("button[data-sport]");

    if (button) {
        setFavoritesFilter(button.dataset.sport);
    }
});

initFavorites();
renderFavorites();