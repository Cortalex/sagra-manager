
### 🚀 Guida all'Integrazione Frontend (TypeScript + Vite Default) - Sagra Manager

Ciao! In questo documento trovi le istruzioni per collegare la tua app React al Server Backend (Node.js). Visto che stai usando la struttura di base di Vite, manterremo tutto semplice aggiungendo solo un paio di file dentro la tua cartella `src/`.

#### Step 1: Librerie Necessarie
Apri il terminale nella root del progetto (dove c'è il `package.json`) e installa queste librerie:
`npm install axios socket.io-client`

---

#### Step 2: Tipi e Configurazione (Nuovi file in `src/`)
Invece di creare mille cartelle, crea semplicemente due file di testo direttamente dentro `src/`, accanto al tuo `App.tsx`:

**1. Crea `src/config.ts` (Per gestire l'IP dinamico della Sagra)**
Il gestionale girerà in rete locale, quindi non usare mai `localhost` o IP fissi. Usa queste funzioni per pescare l'IP che salveremo nel browser:

```typescript
// src/config.ts
export const getApiUrl = (): string => {
    const ip = localStorage.getItem('serverIP') || 'localhost';
    return `http://${ip}:5000/api`;
};

export const getSocketUrl = (): string => {
    const ip = localStorage.getItem('serverIP') || 'localhost';
    return `http://${ip}:5000`;
};
```

**2. Crea `src/types.ts` (Per le interfacce TypeScript)**
Metti qui tutte le definizioni per non sporcare i componenti:

```typescript
// src/types.ts
export interface Configurazione {
    usa_smartphone_tavoli: boolean;
    usa_monitor_cucina: boolean;
}

export interface Articolo {
    id: number;
    nome: string;
    prezzo: number;
}

export interface RigaOrdinePayload {
    id_articolo: number;
    quantita: number;
    prezzo_unitario: number;
    note?: string;
}

export interface CreaOrdinePayload {
    progressivo_giorno: number;
    numero_tavolo: string | null; 
    totale: number;
    metodo_pagamento: string;
    righe: RigaOrdinePayload[];
}
```

---

#### Step 3: Modificare `src/App.tsx` (Il cuore dell'App)
Il tuo file `App.tsx` dovrà fare da "controllore". La primissima volta che l'app si apre, deve chiedere l'IP del server. Se l'IP c'è, mostra il gestionale.

* Controlla se c'è un IP nel `localStorage`.
* Se non c'è, mostra un `<input>` per farlo inserire all'utente e salvalo con `localStorage.setItem('serverIP', valore)`.
* Una volta salvato, fai una chiamata `GET ${getApiUrl()}/configurazione` per recuperare i due flag fondamentali: `usa_smartphone_tavoli` e `usa_monitor_cucina`. Salvali nello stato di `App.tsx` in modo da passarli ai componenti figli.

---

#### Step 4: Chiamate alle API REST
Ora puoi usare Axios importando l'URL e i tipi. Ecco come faresti una chiamata dentro uno dei tuoi componenti:

```typescript
import axios from 'axios';
import { getApiUrl } from './config';
import { Articolo } from './types';

const scaricaMenu = async () => {
    try {
        const response = await axios.get<Articolo[]>(`${getApiUrl()}/articoli`);
        console.log("Menu scaricato:", response.data);
    } catch (error) {
        console.error("Errore di connessione", error);
    }
}
```
*(Le rotte disponibili sono: `categorie`, `zone`, `sconti`, `ingredienti`, `configurazione`, `articoli`, `articolo-ingredienti`. Puoi fare GET, POST, PUT, DELETE).*

---

#### Step 5: Il Flusso Ordini (Bivio Logico nella Cassa)
La Cassa (che puoi creare come un componente separato es. `src/Cassa.tsx`) cambia in base al flag `usa_smartphone_tavoli`:

* **Se FALSE (Tutto in Cassa)**: La Cassa mostra il campo "Tavolo". Invia la `POST` con l'intero `CreaOrdinePayload`. Il backend stampa lo scontrino.
* **Se TRUE (Cameriere + Cassa)**: La Cassa nasconde il "Tavolo". Invia la `POST` con `numero_tavolo: null`. Il backend restituisce l'ID ma *non* stampa. L'app del cameriere farà poi una `PUT /api/ordini/{id}` inviando solo il tavolo. Il server a quel punto sbloccherà la stampa.

---

#### Step 6: Il Monitor Cucina in Tempo Reale
Crea un nuovo file `src/MonitorCucina.tsx`. Se il flag `usa_monitor_cucina` è attivo, mostrerai questo componente. Usa i WebSocket per ricevere gli avvisi senza dover ricaricare la pagina:

```tsx
// src/MonitorCucina.tsx
import React, { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSocketUrl } from './config';

const MonitorCucina: React.FC = () => {
    useEffect(() => {
        const socket: Socket = io(getSocketUrl());

        socket.on('nuovo_ordine_cucina', (dati: { id_ordine: number }) => {
            console.log("Stampa sbloccata per l'ordine:", dati.id_ordine);
            // Qui fai una GET /api/ordini per aggiornare la UI
        });

        return () => { socket.disconnect(); };
    }, []);

    return <div>Monitor Cucina in ascolto...</div>;
};

export default MonitorCucina;
```

***
