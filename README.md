# SportsHub

Applicazione web per la ricerca di squadre sportive, prossime partite e ultimi risultati, realizzata con Bootstrap 5.3.9, CSS custom e JavaScript vanilla (ES Modules), utilizzando le API di [TheSportsDB](https://www.thesportsdb.com/).

```
.
|-- index.html
`-- assets
    |-- css
    |   `-- style.css
    `-- js
        |-- main.js
        `-- squadre.js
```

Per usarla basta avviare un server locale e aprire `index.html` nel browser.

## 🧱 Versione base

- **Ricerca squadre:** barra di ricerca con debounce automatico (dopo 3 caratteri) e gestione delle chiamate concorrenti tramite `AbortController`.
- **Preferiti:** possibilità di salvare e rimuovere le proprie squadre preferite, con persistenza dei dati in `localStorage`.
- **Stile e UI:** layout responsive basato su Bootstrap con personalizzazione dei colori tramite variabili CSS (`--bs-primary`).

## ✨ Extra

- **Dark mode:** switch nell'header per passare dal tema chiaro a quello scuro.
- **Filtri:** pulsanti nella sezione preferiti per filtrare dinamicamente le squadre salvate in base allo sport (*Tutti*, *Calcio*, *Basket*, *Football*).
- **Modale:** cliccando su un singolo evento si apre una modale Bootstrap con i dettagli completi dell'incontro (logo della lega, campionato, stagione, squadre, data e orario).
- **Header dinamico:** l'header sticky si compatta automaticamente con una transizione fluida durante lo scroll della pagina.