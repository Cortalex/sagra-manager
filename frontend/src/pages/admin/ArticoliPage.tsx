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

export function ArticoliPage() {
    const [nome, setNome] = useState<string>('');
    const [prezzo, setPrezzo] = useState<number>(0);
    const [idCategoria, setIdCategoria] = useState<number>(0);
    const [idZona, setIdZona] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);

    const [articoli, setArticoli] = useState<Articolo[]>([]);

    // stati per modifica
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedNome, setEditedNome] = useState<string>('');
    const [editedPrezzo, setEditedPrezzo] = useState<number>(0);
    const [editedIdCategoria, setEditedIdCategoria] = useState<number>(0);
    const [editedIdZona, setEditedIdZona] = useState<number>(0);

    const API_URL = 'http://localhost:5000/api/articoli';

    const fetchArticoli = async () => {
        try {
            const response = await axios.get(API_URL);
            setArticoli(response.data);
        } catch (err) {
            handleAxiosError(err, "Errore nel caricamento articoli");
        }
    };

    useEffect(() => {
        fetchArticoli();
    }, []);

    const handleAxiosError = (err: unknown, defaultMsg: string) => {
        let messaggioErrore = defaultMsg;
        if (axios.isAxiosError(err)) {
            messaggioErrore = err.response?.data?.errore || messaggioErrore;
        }
        alert(messaggioErrore);
    };

    const handleInsert = async () => {
        if (!nome.trim()) {
            alert("Il nome articolo è obbligatorio");
            return;
        }
        if (!idCategoria || !idZona) {
            alert("Categoria e Zona sono obbligatorie");
            return;
        }

        setLoading(true);
        try {
            const nuovoArticolo: Articolo = { nome_articolo: nome, prezzo, id_categoria: idCategoria, id_zona: idZona };
            await axios.post(API_URL, nuovoArticolo);

            setNome('');
            setPrezzo(0);
            setIdCategoria(0);
            setIdZona(0);
            fetchArticoli();
        } catch (err) {
            handleAxiosError(err, "Errore durante l'inserimento");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo articolo?")) return;

        try {
            await axios.delete(`${API_URL}/${id}`);
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
        setEditedIdCategoria(art.id_categoria);
        setEditedIdZona(art.id_zona);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditedNome('');
        setEditedPrezzo(0);
        setEditedIdCategoria(0);
        setEditedIdZona(0);
    };

    const saveEdit = async (id: number) => {
        if (!editedNome.trim()) {
            alert("Il nome articolo è obbligatorio");
            return;
        }
        if (!editedIdCategoria || !editedIdZona) {
            alert("Categoria e Zona sono obbligatorie");
            return;
        }

        try {
            await axios.put(`${API_URL}/${id}`, {
                nome_articolo: editedNome,
                prezzo: editedPrezzo,
                id_categoria: editedIdCategoria,
                id_zona: editedIdZona
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

                <label>Nome:</label>
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
                    onChange={(e) => setPrezzo(parseFloat(e.target.value))}
                    placeholder="Prezzo"
                />

                <label>Categoria (ID):</label>
                <input
                    type="number"
                    value={idCategoria}
                    onChange={(e) => setIdCategoria(parseInt(e.target.value))}
                    placeholder="ID categoria"
                />

                <label>Zona (ID):</label>
                <input
                    type="number"
                    value={idZona}
                    onChange={(e) => setIdZona(parseInt(e.target.value))}
                    placeholder="ID zona"
                />

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
                            {articoli.map((art) => (
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
                                            art.prezzo
                                        )}
                                    </td>

                                    <td>
                                        {editingId === art.id ? (
                                            <input
                                                type="number"
                                                value={editedIdCategoria}
                                                onChange={(e) => setEditedIdCategoria(parseInt(e.target.value))}
                                                className="edit-input"
                                            />
                                        ) : (
                                            art.id_categoria
                                        )}
                                    </td>

                                    <td>
                                        {editingId === art.id ? (
                                            <input
                                                type="number"
                                                value={editedIdZona}
                                                onChange={(e) => setEditedIdZona(parseInt(e.target.value))}
                                                className="edit-input"
                                            />
                                        ) : (
                                            art.id_zona
                                        )}
                                    </td>

                                    <td>
                                        {editingId === art.id ? (
                                            <>
                                                <button
                                                    className="save-btn"
                                                    onClick={() => art.id && saveEdit(art.id)}
                                                >
                                                    Salva
                                                </button>
                                                <button
                                                    className="cancel-btn"
                                                    onClick={cancelEdit}
                                                >
                                                    Annulla
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="edit-btn"
                                                    onClick={() => startEdit(art)}
                                                >
                                                    Modifica
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => art.id && handleDelete(art.id)}
                                                >
                                                    Elimina
                                                </button>
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