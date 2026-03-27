// src/types.ts
export interface Configurazione {
    usa_smartphone_tavoli: boolean;
    usa_monitor_cucina: boolean;
}

export interface Articolo {
    id: number;
    nome_articolo: string;
    prezzo: number;
    id_categoria: string;
    id_zona: string;
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