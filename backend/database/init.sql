-- 1. CREAZIONE TIPI PERSONALIZZATI (ENUM)
DO $$ BEGIN
    CREATE TYPE public.stato_ordine AS ENUM ('nuovo', 'in_lavorazione', 'evaso');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;


-- 2. TABELLE INDIPENDENTI

CREATE TABLE IF NOT EXISTS public.zone (
    id serial4 PRIMARY KEY,
    nome_zona varchar(255) NULL
);

CREATE TABLE IF NOT EXISTS public.sconti (
    id serial4 PRIMARY KEY,
    nome_sconto varchar(255) NULL,
    valore int4 NULL,
    tipo varchar(255) NULL,
    data_inizio date NULL,
    data_fine date NULL,
    CONSTRAINT check_date_range CHECK (data_inizio <= data_fine)
);

CREATE TABLE IF NOT EXISTS public.ingredienti (
    id serial4 PRIMARY KEY,
    nome_ingrediente varchar(255) NULL,
    prezzo int4 NULL,
    quantita int4 NULL,
    obbligatorio bool DEFAULT false NULL
);

CREATE TABLE IF NOT EXISTS public.configurazione (
    id serial4 PRIMARY KEY,
    nome_sagra varchar(255) NULL,
    "password" varchar(255) NULL,
    costo_coperto int4 NULL,
    costo_asporto int4 NULL,
    quantita_soglia int4 NULL,
    area varchar NULL,
    cassa varchar NULL,
    usa_smartphone_tavoli bool DEFAULT false NULL,
    usa_monitor_cucina bool DEFAULT false NULL,
    obbligo_nome_cliente boolean DEFAULT false,
    obbligo_numero_tavolo boolean DEFAULT false,
    obbligo_coperti boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.categorie (
    id serial4 PRIMARY KEY,
    nome_categoria varchar(255) NULL,
    visibile bool DEFAULT true NULL
);


-- 3. TABELLE DI PRIMO LIVELLO

CREATE TABLE IF NOT EXISTS public.articoli (
    id serial4 PRIMARY KEY,
    nome_articolo varchar(255) NULL,
    prezzo int4 NULL,
    id_categoria int4 NULL REFERENCES public.categorie(id) ON DELETE CASCADE ON UPDATE CASCADE,
    id_zona int4 NULL REFERENCES public.zone(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS public.ordini (
    id serial4 PRIMARY KEY,
    progressivo_giorno int4 NULL,
    nome_cliente varchar(255) NULL,
    coperti int4 NULL,
    numero_tavolo int4 NULL,
    note varchar(255) NULL,
    metodo_pagamento varchar(255) NULL,
    totale int4 NULL,
    resto int4 NULL,
    serata timestamp NULL,
    "data" date NULL,
    ora time NULL,
    stato public.stato_ordine DEFAULT 'nuovo'::stato_ordine NULL,
    stampato bool NULL,
    asporto bool NULL,
    omaggio bool NULL,
    id_sconto int4 NULL REFERENCES public.sconti(id)
);


-- 4. TABELLE DI SECONDO LIVELLO

CREATE TABLE IF NOT EXISTS public.articolo_ingrediente (
    id_articolo int4 NOT NULL REFERENCES public.articoli(id) ON DELETE CASCADE ON UPDATE CASCADE,
    id_ingrediente int4 NOT NULL REFERENCES public.ingredienti(id) ON DELETE CASCADE ON UPDATE CASCADE,
    quantita_necessaria int4 NULL,
    obbligatorio bool NULL,
    PRIMARY KEY (id_articolo, id_ingrediente)
);

CREATE TABLE IF NOT EXISTS public.righe_ordine (
    id serial4 PRIMARY KEY,
    quantita int4 NULL,
    stato public.stato_ordine DEFAULT 'nuovo'::stato_ordine NULL,
    prezzo_unitario int4 NULL,
    note varchar(255) NULL,
    id_ordine int4 NULL REFERENCES public.ordini(id) ON DELETE CASCADE,
    id_articolo int4 NULL REFERENCES public.articoli(id)
);

CREATE TABLE IF NOT EXISTS public.righe_ordine_ingredienti (
    id_riga_ordine int4 NOT NULL REFERENCES public.righe_ordine(id) ON DELETE CASCADE,
    id_ingrediente int4 NOT NULL REFERENCES public.ingredienti(id) ON DELETE CASCADE,
    prezzo_aggiuntivo int4 DEFAULT 0,
    PRIMARY KEY (id_riga_ordine, id_ingrediente)
);