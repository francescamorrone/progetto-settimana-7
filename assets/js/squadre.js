const SEZIONE_SQUADRE = document.querySelector("#sezione-squadre");
const SQUADRE = document.querySelector("#squadre");
const PREFERITE = document.querySelector("#preferite");
const FILTRI = document.querySelector("#filtri");
const DETTAGLI_SECTION = document.querySelector("#dettagli-section");
const NOME_SQUADRA = document.querySelector("#nome-squadra");
const PROSSIMI = document.querySelector("#prossimi");
const RISULTATI = document.querySelector("#risultati");
const STORAGE_KEY = "preferite";
const MODAL_LEGA_LOGO = document.querySelector("#modal-lega-logo");
const MODAL_CAMPIONATO = document.querySelector("#modal-campionato");
const MODAL_ANNO = document.querySelector("#modal-anno");
const MODAL_DATA = document.querySelector("#modal-data");
const MODAL_ORA = document.querySelector("#modal-ora");
const MODAL_CASA = document.querySelector("#modal-casa");
const MODAL_TRASFERTA = document.querySelector("#modal-trasferta");

export class Squadra {
    constructor(dati) {
        this.id = dati.idTeam;
        this.nome = dati.strTeam;
        this.logo = dati.strBadge;
        this.lega = dati.strLeague ?? "-";
        this.paese = dati.strCountry ?? "-";
        this.sport = dati.strSport;
    }
}

export class Evento {
    constructor(dati) {
        this.id = dati.idEvent;
        this.data = dati.dateEvent;
        this.timestamp = dati.strTimestamp;
        this.casa = dati.strHomeTeam;
        this.trasferta = dati.strAwayTeam;
        this.punteggioCasa = dati.intHomeScore;
        this.punteggioTrasferta = dati.intAwayScore;
        this.campionato = dati.strLeague ?? "-";
        this.stagione = dati.strSeason ?? "-";
        this.logoLega = dati.strLeagueBadge;
    }

    getDateTime() {

        if (!this.timestamp) {
            return null;
        }

        const date = new Date(`${this.timestamp}Z`);

        if (Number.isNaN(date.getTime())) {
            return null;
        }

        return date;
    }

    formatDate() {

        if (!this.data) {
            return "Data da definire";
        }

        const date = new Date(this.data);

        return new Intl.DateTimeFormat("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(date);
    }

    formatModalDate() {

        const date = this.getDateTime();

        if (!date) {
            return this.formatDate();
        }

        return new Intl.DateTimeFormat("it-IT", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }).format(date);
    }

    formatTime() {

        const date = this.getDateTime();

        if (!date) {
            return "Ora da definire";
        }

        return new Intl.DateTimeFormat("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    }

    getScore() {

        if (this.punteggioCasa === null || this.punteggioCasa === undefined) {
            return "";
        }
        if (this.punteggioTrasferta === null || this.punteggioTrasferta === undefined) {
            return "";
        }

        return `${this.punteggioCasa} – ${this.punteggioTrasferta}`;
    }
}

let favorites = [];
let currentSport = "all";

const saveFavorites = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
};

const loadFavorites = () => {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
        const parsedTeams = JSON.parse(savedData);
        const favTeamsArray = [];

        parsedTeams.forEach((t) => {

            const team = new Squadra({
                idTeam: t.id,
                strTeam: t.nome,
                strBadge: t.logo,
                strLeague: t.lega,
                strCountry: t.paese,
                strSport: t.sport
            });

            favTeamsArray.push(team);
        });

        return favTeamsArray;

    } else {
        return [];
    }
};

favorites = loadFavorites();

const getFilteredFavorites = () => {

    if (currentSport === "all") {
        return favorites;
    }

    return favorites.filter((f) => {
        return f.sport === currentSport;
    });
};

const createButton = (action, text, className) => {

    const btn = document.createElement("button");

    btn.textContent = text;
    btn.type = "button";
    btn.className = className;
    btn.dataset.action = action;
    return btn;
};

const updateFavoriteButton = (btn, id) => {

    const found = favorites.find((fav) => fav.id === id);

    if (found) {
        btn.textContent = "★ Nei preferiti";
        btn.disabled = true;
    } else {
        btn.textContent = "★ Aggiungi ai preferiti";
        btn.disabled = false;
    }
};

const refreshFavoriteButtons = () => {

    const buttons = SQUADRE.querySelectorAll("button[data-action='favorite']");

    buttons.forEach((b) => {
        updateFavoriteButton(b, b.closest("[data-id]").dataset.id);
    });
};

const createTeamCard = (team) => {

    const card = document.createElement("div");

    card.className = "card scheda-squadra h-100 text-center border-0 shadow-sm p-3";
    card.dataset.id = team.id;
    card.dataset.name = team.nome;

    if (team.logo) {
        const logoImg = document.createElement("img");
        logoImg.className = "object-fit-contain mx-auto mb-3";
        logoImg.setAttribute("width", "100");
        logoImg.setAttribute("height", "100");
        logoImg.src = team.logo;
        logoImg.alt = team.nome;
        card.append(logoImg);
    }

    const nameTitle = document.createElement("h3");
    nameTitle.className = "fs-6 fw-bold mb-3";
    nameTitle.textContent = team.nome;

    const leagueText = document.createElement("p");
    leagueText.className = "small text-secondary mb-1";
    leagueText.textContent = team.lega;

    const countryText = document.createElement("p");
    countryText.className = "small text-secondary mb-3";
    countryText.textContent = team.paese;

    card.append(nameTitle, leagueText, countryText);
    return card;
};

export const renderFavorites = () => {
    PREFERITE.textContent = "";

    const list = getFilteredFavorites();

    if (list.length === 0) {

        const emptyCol = document.createElement("div");
        emptyCol.className = "col-12";

        const emptyText = document.createElement("p");
        emptyText.className = "fst-italic";

        if (favorites.length === 0) {
            emptyText.textContent = "Nessuna squadra preferita";
        } else {
            emptyText.textContent = "Nessuna squadra preferita per questo sport";
        }

        emptyCol.append(emptyText);
        PREFERITE.append(emptyCol);

    } else {

        list.forEach((fav) => {

            const col = document.createElement("div");
            col.className = "col-12 col-md-6 col-lg-4";

            const card = createTeamCard(fav);

            const removeBtn = createButton("remove", "Rimuovi", "btn btn-outline-danger btn-sm fw-semibold w-100 mt-auto");

            const trashIcon = document.createElement("i");
            trashIcon.className = "bi bi-trash me-1";
            removeBtn.prepend(trashIcon);

            card.append(removeBtn);
            col.append(card);
            PREFERITE.append(col);
        });
    }
};

export const setFavoritesFilter = (sport) => {

    currentSport = sport;

    const buttons = FILTRI.querySelectorAll("button[data-sport]");

    buttons.forEach((b) => {
        if (b.dataset.sport === sport) {
            b.classList.add("active");
        } else {
            b.classList.remove("active");
        }
    });

    renderFavorites();
};

export const addFavorite = (team) => {

    const found = favorites.find((f) => f.id === team.id);

    if (!found) {
        favorites.push(team);
        saveFavorites();
        renderFavorites();
        refreshFavoriteButtons();
    }
};

export const removeFavorite = (id) => {
    favorites = favorites.filter((f) => {
        return f.id !== id;
    });

    saveFavorites();
    renderFavorites();
    refreshFavoriteButtons();
};

export const renderTeams = (teams) => {
    SEZIONE_SQUADRE.removeAttribute("hidden");
    SQUADRE.textContent = "";

    if (teams.length === 0) {
        const emptyCol = document.createElement("div");
        emptyCol.className = "col-12";

        const emptyText = document.createElement("p");
        emptyText.className = "fst-italic";
        emptyText.textContent = "Nessuna squadra trovata";

        emptyCol.append(emptyText);
        SQUADRE.append(emptyCol);

    } else {

        teams.forEach((t) => {
            const col = document.createElement("div");
            col.className = "col-12 col-md-6 col-lg-4";

            const card = createTeamCard(t);

            const favoriteBtn = createButton("favorite", "", "btn btn-outline-warning btn-sm fw-semibold w-100 mt-auto");
            updateFavoriteButton(favoriteBtn, t.id);

            card.append(favoriteBtn);
            col.append(card);
            SQUADRE.append(col);
        });
    }
};

export const clearTeams = () => {
    SQUADRE.textContent = "";
    SEZIONE_SQUADRE.setAttribute("hidden", "true");
};

const renderEvents = (list, events, emptyMessage) => {
    list.textContent = "";

    if (events.length === 0) {

        const emptyLi = document.createElement("li");

        emptyLi.className = "list-group-item fst-italic px-0";
        emptyLi.textContent = emptyMessage;
        list.append(emptyLi);

    } else {
        events.forEach((e) => {
            const li = document.createElement("li");
            li.className = "list-group-item list-group-item-action px-0";
            li.dataset.id = e.id;
            li.dataset.bsToggle = "modal";
            li.dataset.bsTarget = "#evento-modal";

            const dateDiv = document.createElement("div");
            dateDiv.className = "small text-secondary";
            dateDiv.textContent = e.formatDate();

            const matchDiv = document.createElement("div");

            const matchSpan = document.createElement("span");
            matchSpan.className = "fw-bold";
            matchSpan.textContent = `${e.casa} vs ${e.trasferta}`;

            matchDiv.append(matchSpan);

            const score = e.getScore();
            if (score !== "") {
                const scoreSpan = document.createElement("span");
                scoreSpan.className = "badge bg-success fw-normal ms-2";
                scoreSpan.textContent = score;
                matchDiv.append(scoreSpan);
            }

            li.append(dateDiv, matchDiv);
            list.append(li);
        });
    }
};

export const renderDetails = (name, nextEvents, lastEvents) => {

    NOME_SQUADRA.textContent = name;

    renderEvents(PROSSIMI, nextEvents, "Nessun evento in programma");
    renderEvents(RISULTATI, lastEvents, "Nessun risultato disponibile");

    DETTAGLI_SECTION.removeAttribute("hidden");
    DETTAGLI_SECTION.scrollIntoView({ behavior: "smooth" });
};

export const renderEventModal = (evento) => {

    MODAL_CAMPIONATO.textContent = evento.campionato;
    MODAL_ANNO.textContent = evento.stagione;
    MODAL_DATA.textContent = evento.formatModalDate();
    MODAL_ORA.textContent = evento.formatTime();
    MODAL_CASA.textContent = evento.casa;
    MODAL_TRASFERTA.textContent = evento.trasferta;

    if (evento.logoLega) {
        MODAL_LEGA_LOGO.src = evento.logoLega;
        MODAL_LEGA_LOGO.alt = evento.campionato;
        MODAL_LEGA_LOGO.removeAttribute("hidden");
    } else {
        MODAL_LEGA_LOGO.setAttribute("hidden", "true");
    }
};

export const hideDetails = () => {
    DETTAGLI_SECTION.setAttribute("hidden", "true");
};

export const initFavorites = () => {

    window.addEventListener("storage", (e) => {

        if (e.key === STORAGE_KEY || e.key === null) {
            favorites = loadFavorites();
            renderFavorites();
            refreshFavoriteButtons();
        }
    });
};