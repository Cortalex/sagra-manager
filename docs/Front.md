# 🚀 Guida Definitiva all'Integrazione Frontend - Sagra Manager

Ciao! In questo documento trovi tutte le istruzioni e le logiche necessarie per collegare le interfacce React al Server Backend (Node.js). Leggi attentamente la sezione sull'IP e sul Flusso Ordini, poiché l'app deve adattarsi dinamicamente alle impostazioni scelte dalla sagra.

### Step 1: Librerie Necessarie
Per comunicare col backend ti serviranno queste due librerie (installabili tramite `npm install axios socket.io-client`):
* **`axios`**: Consigliato al posto del `fetch` nativo per gestire le chiamate HTTP (GET, POST, PUT, DELETE) in modo più pulito.
* **`socket.io-client`**: Fondamentale per ricevere gli avvisi in tempo reale sul Monitor della Cucina senza dover ricaricare la pagina.

---

### Step 2: Schermata di Setup Iniziale (Gestione IP Server Dinamica)
Poiché il gestionale girerà su una rete locale (LAN/Wi-Fi della sagra), **non devi mai usare `localhost` o IP fissi** nel codice React, altrimenti l'app cercherà il server nel dispositivo sbagliato.

1.  **Schermata di Benvenuto:** La primissima volta che l'app viene aperta (su un PC Cassa o sullo smartphone di un cameriere), devi mostrare una schermata di "Setup" con un campo di testo: *"Inserisci l'indirizzo IP del Server"*.
2.  **Salvataggio Locale:** Salva il valore inserito nel `localStorage` del browser: 
    `localStorage.setItem('serverIP', '192.168.1.100')`
3.  **URL Dinamico:** Crea un file di configurazione (es. `src/config.js`) con delle funzioni centralizzate per generare l'URL base pescando l'IP salvato:

```javascript
// src/config.js
export const getApiUrl = () => {
    const ip = localStorage.getItem('serverIP') || 'localhost';
    return `http://${ip}:5000/api`;
};

export const getSocketUrl = () => {
    const ip = localStorage.getItem('serverIP') || 'localhost';
    return `http://${ip}:5000`;
};
```

---

### Step 3: La Pagina Impostazioni (Configurazione Globale)
Dovrai creare una pagina "Impostazioni" (riservata agli admin) che farà chiamate `GET` e `PUT` all'indirizzo `/api/configurazione`.
Tra i vari dati restituiti dal backend, troverai due flag booleani importantissimi:
* `usa_smartphone_tavoli`
* `usa_monitor_cucina`

**Attenzione:** Questi flag cambiano radicalmente il comportamento della schermata di Cassa. Ti consiglio di salvarli nello stato globale dell'app (es. Context API, Redux o Zustand) fin dall'avvio, così da averli sempre a disposizione.

---

### Step 4: Mappa delle API REST (CRUD di Base)
Il backend risponde sempre in formato JSON. Ecco le rotte a tua disposizione per le operazioni standard. 
Sostituisci `[tabella]` con: `categorie`, `zone`, `sconti`, `ingredienti`, `configurazione`, `articoli`, `articolo-ingredienti`.

* **Lettura (GET):** `GET ${getApiUrl()}/[tabella]`
    * *Risposta attesa:* Un array di oggetti `[ { id: 1, ... }, { id: 2, ... } ]`
* **Creazione (POST):** `POST ${getApiUrl()}/[tabella]`
    * *Body richiesto:* JSON con i campi della tabella.
* **Modifica (PUT):** `PUT ${getApiUrl()}/[tabella]/{id}`
    * *Body richiesto:* Solo i campi che vuoi aggiornare.
* **Eliminazione (DELETE):** `DELETE ${getApiUrl()}/[tabella]/{id}`

*Esempio pratico:*
```javascript
// Per scaricare il menu e mostrarlo a schermo
const response = await axios.get(`${getApiUrl()}/articoli`);
console.log(response.data); 
```

---

### Step 5: Il Flusso degli Ordini (Bivio Logico)
La tabella `ordini` è speciale: l'inserimento della testata e delle sue righe (i piatti) avviene in un'unica chiamata protetta da Transazione SQL. 
Il comportamento della tua interfaccia in Cassa dipenderà dal flag `usa_smartphone_tavoli`.

**CASO A: `usa_smartphone_tavoli` è FALSE (Flusso Rapido - Tutto in Cassa)**
1.  **Interfaccia:** La Cassa DEVE mostrare il campo "Numero Tavolo". Il cassiere compila i piatti, assegna il tavolo e preme Paga.
2.  **Chiamata:** Fai una `POST /api/ordini` includendo il tavolo nel JSON.
3.  **Backend:** Il server salva l'ordine, stampa istantaneamente lo scontrino e avvisa la cucina.

**CASO B: `usa_smartphone_tavoli` è TRUE (Flusso Cassa + Cameriere)**
1.  **Interfaccia Cassa:** La Cassa NASCONDE il campo "Numero Tavolo". Il cassiere batte i piatti, prende i soldi e preme Invia.
2.  **Chiamata Cassa:** Fai una `POST /api/ordini` inviando `numero_tavolo: null`. Il server salva l'ordine e ti restituisce un `id`. *(Nota: in questo momento il server NON stampa nulla).*
3.  **Il Cameriere:** Il cassiere comunica l'ID a voce (es. "Ordine 45!"). Il cameriere va al tavolo 12, apre l'app sul telefono, seleziona l'ordine 45 e inserisce "Tavolo 12".
4.  **Chiamata Smartphone:** L'app del cameriere fa una `PUT /api/ordini/45` inviando solo `{ "numero_tavolo": "Tavolo 12" }`.
5.  **Backend:** Appena il server riceve questa PUT, sblocca la stampa fisica in cassa e manda l'avviso al Monitor Cucina.

*Esempio di JSON per la Creazione Ordine (Metodo POST):*
```json
{
  "progressivo_giorno": 45,
  "numero_tavolo": null, 
  "totale": 25.50,
  "metodo_pagamento": "Contanti",
  "righe": [
     { "id_articolo": 2, "quantita": 2, "prezzo_unitario": 5.00, "note": "Senza cipolla" },
     { "id_articolo": 5, "quantita": 1, "prezzo_unitario": 15.50, "note": "" }
  ]
}
```

---

### Step 6: Il Monitor Cucina (Tempo Reale con WebSockets)
Se il flag `usa_monitor_cucina` è attivo, devi abilitare la pagina del Monitor. 
Non usare il polling (nessuna chiamata GET a ripetizione ogni X secondi). Usa `socket.io-client` per metterti in ascolto passivo degli eventi inviati dal server:

```javascript
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { getSocketUrl } from '../config'; 

function MonitorCucina() {
    useEffect(() => {
        // Connessione al WebSocket del server
        const socket = io(getSocketUrl());

        // Mettiti in ascolto dell'evento specifico
        socket.on('nuovo_ordine_cucina', (dati) => {
            console.log("Nuovo ordine sbloccato per la cucina! ID:", dati.id_ordine);
            // Qui puoi effettuare una GET /api/ordini per ricaricare 
            // la lista degli ordini e far apparire il nuovo scontrino a schermo.
        });

        // Pulizia alla chiusura del componente
        return () => socket.disconnect();
    }, []);

    return <div>Monitor Cucina in attesa di nuovi ordini...</div>;
}
```
