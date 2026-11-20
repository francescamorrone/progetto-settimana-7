// SportsHub — Week Project Settimana VII
//
// Devi fare 4 cose per la Versione Base:
// 1. Definire le classi Squadra ed Evento (mappano i dati di TheSportsDB)
// 2. Funzione async cercaSquadre(query) che chiama /searchteams.php
// 3. Funzione async caricaDettagli(idTeam) che chiama in parallelo
//    eventsnext.php + eventslast.php usando Promise.all
// 4. Render dinamico: card squadre, lista prossimi eventi, lista risultati
//
// Endpoint base: https://www.thesportsdb.com/api/v1/json/3/
// Il `3` nell'URL è la chiave API pubblica di test di TheSportsDB: gratis, non serve registrarsi.
//
// Per le versioni Intermedia/Avanzata: localStorage preferiti, debounce, Promise.all multi.


const SEZIONE_SQUADRE = document.querySelector("#sezione-squadre");
const SQUADRE = document.querySelector("#squadre");
const DETTAGLI_SECTION = document.querySelector("#dettagli-section");
const NOME_SQUADRA = document.querySelector("#nome-squadra");
const PROSSIMI = document.querySelector("#prossimi");
const RISULTATI = document.querySelector("#risultati");

// === Classi ===

export class Squadra {
    constructor(dati) {
        this.id = dati.idTeam;
        this.nome = dati.strTeam;
        this.logo = dati.strBadge;
        this.lega = dati.strLeague ?? "-";
        this.paese = dati.strCountry ?? "-";
        this.sport = dati.strSport; //filtro della versione avanzata
    }
}

export class Evento {
    constructor(dati) {
        this.id = dati.idEvent;
        this.data = dati.dateEvent;
        this.casa = dati.strHomeTeam;
        this.trasferta = dati.strAwayTeam;
        this.punteggioCasa = dati.intHomeScore;
        this.punteggioTrasferta = dati.intAwayScore;
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

            const card = document.createElement("div");
            card.className = "card scheda-squadra h-100 text-center";
            card.dataset.id = t.id;
            card.dataset.name = t.nome;

            if (t.logo) {
                const logoImg = document.createElement("img");
                logoImg.className = "logo-squadra";
                logoImg.src = t.logo;
                logoImg.alt = t.nome;
                card.append(logoImg);
            }

            const nameTitle = document.createElement("h3");
            nameTitle.textContent = t.nome;

            const leagueText = document.createElement("p");
            leagueText.textContent = t.lega;

            const countryText = document.createElement("p");
            countryText.textContent = t.paese;

            card.append(nameTitle, leagueText, countryText);
            col.append(card);
            SQUADRE.append(col);
        });
    }
};

const renderEvents = (list, events, emptyMessage) => {
    list.textContent = "";

    if (events.length === 0) {
        const emptyLi = document.createElement("li");
        emptyLi.className = "evento evento-vuoto";
        emptyLi.textContent = emptyMessage;
        list.append(emptyLi);

    } else {
        events.forEach((e) => {
            const li = document.createElement("li");
            li.className = "evento";
            li.dataset.id = e.id;

            const dateDiv = document.createElement("div");
            dateDiv.className = "evento-data";
            dateDiv.textContent = e.formatDate();

            const matchDiv = document.createElement("div");

            const matchSpan = document.createElement("span");
            matchSpan.className = "evento-partita";
            matchSpan.textContent = `${e.casa} vs ${e.trasferta}`;

            matchDiv.append(matchSpan);

            const score = e.getScore();
            if (score !== "") {
                const scoreSpan = document.createElement("span");
                scoreSpan.className = "badge badge-punteggio";
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

//funzione per nascondere i dettagli
export const hideDetails = () => {
    DETTAGLI_SECTION.setAttribute("hidden", "true");
};