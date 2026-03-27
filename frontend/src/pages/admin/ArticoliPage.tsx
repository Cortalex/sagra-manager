import { useState, useEffect } from 'react';
import axios from 'axios';
import './ArticoliPage.css';

interface Articolo {
    id?: number;
    nome_articolo: string;
    prezzo: number;
    id_categoria: number;
    id_zona: number;
}

interface Categoria {
    id: number;
    nome_categoria: string;
}

interface Zona {
    id: number;
    nome_zona: string;
}

export function ArticoliPage() {
    const [articoli, setArticoli] = useState<Articolo[]>([]);
    const [nome, setNome] = useState<string>('');
    const [prezzo, setPrezzo] = useState<string>('');
    const [categoriaSelezionata, setCategoriaSelezionata] = useState<number | null>(null);
    const [zonaSelezionata, setZonaSelezionata] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedNome, setEditedNome] = useState<string>('');
    const [editedPrezzo, setEditedPrezzo] = useState<number>(0);
    const [editedCategoria, setEditedCategoria] = useState<number | null>(null);
    const [editedZona, setEditedZona] = useState<number | null>(null);

    const [categorie, setCategorie] = useState<Categoria[]>([]);
    const [zone, setZone] = useState<Zona[]>([]);

    const API_ARTICOLI = 'http://localhost:5000/api/articoli';
    const API_CATEGORIE = 'http://localhost:5000/api/categorie';
    const API_ZONE = 'http://localhost:5000/api/zone';

    // Carica articoli
    const fetchArticoli = async () => {
        try {
            const response = await axios.get(API_ARTICOLI);
            setArticoli(response.data);
        } catch (err) {
            handleAxiosError(err, "Errore nel caricamento articoli");
        }
    };

    // Carica categorie e zone
    const fetchCategorie = async () => {
        try {
            const response = await axios.get(API_CATEGORIE);
            setCategorie(response.data);
        } catch (err) {
            handleAxiosError(err, "Errore nel caricamento categorie");
        }
    };

    const fetchZone = async () => {
        try {
            const response = await axios.get(API_ZONE);
            setZone(response.data);
        } catch (err) {
            handleAxiosError(err, "Errore nel caricamento zone");
        }
    };

    useEffect(() => {
        fetchArticoli();
        fetchCategorie();
        fetchZone();
    }, []);

    const handleAxiosError = (err: unknown, defaultMsg: string) => {
        let messaggioErrore = defaultMsg;
        if (axios.isAxiosError(err)) {
            messaggioErrore = err.response?.data?.errore || messaggioErrore;
        }
        alert(messaggioErrore);
    };

    // Inserimento nuovo articolo
    const handleInsert = async () => {
        if (!nome.trim() || prezzo === '' || !categoriaSelezionata || !zonaSelezionata) {
            alert("Compila tutti i campi obbligatori");
            return;
        }

        setLoading(true);
        try {
            const nuovoArticolo: Articolo = {
                nome_articolo: nome,
                prezzo: parseFloat(prezzo),
                id_categoria: categoriaSelezionata,
                id_zona: zonaSelezionata
            };
            await axios.post(API_ARTICOLI, nuovoArticolo);

            setNome('');
            setPrezzo('');
            setCategoriaSelezionata(null);
            setZonaSelezionata(null);
            fetchArticoli();
        } catch (err) {
            handleAxiosError(err, "Errore durante l'inserimento");
        } finally {
            setLoading(false);
        }
    };

    // Eliminazione
    const handleDelete = async (id: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo articolo?")) return;

        try {
            await axios.delete(`${API_ARTICOLI}/${id}`);
            fetchArticoli();
        } catch (err) {
            handleAxiosError(err, "Errore durante l'eliminazione");
        }
    };

    // EDIT
    const startEdit = (art: Articolo) => {
        setEditingId(art.id || null);
        setEditedNome(art.nome_articolo);
        setEditedPrezzo(art.prezzo);
        setEditedCategoria(art.id_categoria);
        setEditedZona(art.id_zona);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditedNome('');
        setEditedPrezzo(0);
        setEditedCategoria(null);
        setEditedZona(null);
    };

    const saveEdit = async (id: number) => {
        if (!editedNome.trim() || !editedCategoria || !editedZona) {
            alert("Compila tutti i campi obbligatori");
            return;
        }

        try {
            await axios.put(`${API_ARTICOLI}/${id}`, {
                nome_articolo: editedNome,
                prezzo: editedPrezzo,
                id_categoria: editedCategoria,
                id_zona: editedZona
            });

            cancelEdit();
            fetchArticoli();
        } catch (err) {
            handleAxiosError(err, "Errore durante la modifica");
        }
    };

    return (
        <div className="articoli-page-container">
            <div className="articoli-input-container">
                <h3>Nuovo Articolo</h3>

                <label>Nome Articolo:</label>
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome articolo"
                />

                <label>Prezzo:</label>
                <input
                    type="number"
                    value={prezzo}
                    onChange={(e) => setPrezzo(e.target.value)}
                    placeholder="0.00"
                />

                <label>Categoria:</label>
                <select
                    value={categoriaSelezionata || ''}
                    onChange={(e) => setCategoriaSelezionata(parseInt(e.target.value))}
                >
                    <option value="">Seleziona categoria</option>
                    {categorie.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nome_categoria}</option>
                    ))}
                </select>

                <label>Zona:</label>
                <select
                    value={zonaSelezionata || ''}
                    onChange={(e) => setZonaSelezionata(parseInt(e.target.value))}
                >
                    <option value="">Seleziona zona</option>
                    {zone.map(z => (
                        <option key={z.id} value={z.id}>{z.nome_zona}</option>
                    ))}
                </select>

                <button onClick={handleInsert} disabled={loading}>
                    {loading ? 'Inserimento...' : 'Inserisci'}
                </button>
            </div>

            <div className="articoli-display-container">
                <h3>Elenco Articoli</h3>

                <div className="scrollable-table-wrapper">
                    <table className="articoli-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Prezzo</th>
                                <th>Categoria</th>
                                <th>Zona</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>

                        <tbody>
                            {articoli.map(art => (
                                <tr key={art.id}>
                                    <td>{art.id}</td>

                                    <td>
                                        {editingId === art.id ? (
                                            <input
                                                type="text"
                                                value={editedNome}
                                                onChange={(e) => setEditedNome(e.target.value)}
                                                className="edit-input"
                                            />
                                        ) : (
                                            art.nome_articolo
                                        )}
                                    </td>

                                    <td>
                                        {editingId === art.id ? (
                                            <input
                                                type="number"
                                                value={editedPrezzo}
                                                onChange={(e) => setEditedPrezzo(parseFloat(e.target.value))}
                                                className="edit-input"
                                            />
                                        ) : (
                                            `€ ${art.prezzo.toFixed(2)}`
                                        )}
                                    </td>

                                    <td>
                                        {editingId === art.id ? (
                                            <select
                                                value={editedCategoria || ''}
                                                onChange={(e) => setEditedCategoria(parseInt(e.target.value))}
                                                className="edit-input"
                                            >
                                                {categorie.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.nome_categoria}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            categorie.find(c => c.id === art.id_categoria)?.nome_categoria
                                        )}
                                    </td>

                                    <td>
                                        {editingId === art.id ? (
                                            <select
                                                value={editedZona || ''}
                                                onChange={(e) => setEditedZona(parseInt(e.target.value))}
                                                className="edit-input"
                                            >
                                                {zone.map(z => (
                                                    <option key={z.id} value={z.id}>{z.nome_zona}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            zone.find(z => z.id === art.id_zona)?.nome_zona
                                        )}
                                    </td>

                                    <td>
                                        {editingId === art.id ? (
                                            <>
                                                <button className="save-btn" onClick={() => art.id && saveEdit(art.id)}>Salva</button>
                                                <button className="cancel-btn" onClick={cancelEdit}>Annulla</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="edit-btn" onClick={() => startEdit(art)}>Modifica</button>
                                                <button className="delete-btn" onClick={() => art.id && handleDelete(art.id)}>Elimina</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}