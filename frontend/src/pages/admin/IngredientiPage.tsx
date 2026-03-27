import { useState, useEffect } from 'react';
import axios from 'axios';
import './IngredientiPage.css';

interface Ingrediente {
    id?: number;
    nome_ingrediente: string;
    prezzo: number;
    quantita: number;
}

export function IngredientiPage() {
    const [nome, setNome] = useState<string>('');
    const [prezzo, setPrezzo] = useState<string>('');
    const [quantita, setQuantita] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const [ingredienti, setIngredienti] = useState<Ingrediente[]>([]);

    // 🔹 stati per modifica
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedNome, setEditedNome] = useState<string>('');
    const [editedPrezzo, setEditedPrezzo] = useState<number>(0);
    const [editedQuantita, setEditedQuantita] = useState<number>(0);

    const API_URL = 'http://localhost:5000/api/ingredienti';

    const fetchIngredienti = async () => {
        try {
            const response = await axios.get(API_URL);
            setIngredienti(response.data);
        } catch (err) {
            handleAxiosError(err, "Errore nel caricamento ingredienti");
        }
    };

    useEffect(() => {
        fetchIngredienti();
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
            alert("Il nome ingrediente è obbligatorio");
            return;
        }

        setLoading(true);
        try {
            const nuovoIngrediente: Ingrediente = {
                nome_ingrediente: nome,
                prezzo: parseFloat(prezzo) || 0,
                quantita: parseInt(quantita) || 0
            };
            await axios.post(API_URL, nuovoIngrediente);

            setNome('');
            setPrezzo('');
            setQuantita('');
            fetchIngredienti();
        } catch (err) {
            handleAxiosError(err, "Errore durante l'inserimento");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo ingrediente?")) return;

        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchIngredienti();
        } catch (err) {
            handleAxiosError(err, "Errore durante l'eliminazione");
        }
    };

    // 🔹 EDIT
    const startEdit = (ing: Ingrediente) => {
        setEditingId(ing.id || null);
        setEditedNome(ing.nome_ingrediente);
        setEditedPrezzo(ing.prezzo);
        setEditedQuantita(ing.quantita);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditedNome('');
        setEditedPrezzo(0);
        setEditedQuantita(0);
    };

    const saveEdit = async (id: number) => {
        if (!editedNome.trim()) {
            alert("Il nome ingrediente è obbligatorio");
            return;
        }

        try {
            await axios.put(`${API_URL}/${id}`, {
                nome_ingrediente: editedNome,
                prezzo: editedPrezzo,
                quantita: editedQuantita
            });

            cancelEdit();
            fetchIngredienti();
        } catch (err) {
            handleAxiosError(err, "Errore durante la modifica");
        }
    };

    return (
        <div className="ingredienti-page-container">
            <div className="ingredienti-input-container">
                <h3>Nuovo Ingrediente</h3>

                <label>Nome:</label>
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome ingrediente"
                />

                <label>Prezzo:</label>
                <input
                    type="number"
                    value={prezzo}
                    onChange={(e) => setPrezzo(e.target.value)}
                    placeholder="0.00"
                />

                <label>Quantità:</label>
                <input
                    type="number"
                    value={quantita}
                    onChange={(e) => setQuantita(e.target.value)}
                    placeholder="0"
                />

                <button onClick={handleInsert} disabled={loading}>
                    {loading ? 'Inserimento...' : 'Inserisci'}
                </button>
            </div>

            <div className="ingredienti-display-container">
                <h3>Elenco Ingredienti</h3>

                <div className="scrollable-table-wrapper">
                    <table className="ingredienti-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Prezzo</th>
                                <th>Quantità</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ingredienti.map((ing) => (
                                <tr key={ing.id}>
                                    <td>{ing.id}</td>

                                    <td>
                                        {editingId === ing.id ? (
                                            <input
                                                type="text"
                                                value={editedNome}
                                                onChange={(e) => setEditedNome(e.target.value)}
                                                className="edit-input"
                                            />
                                        ) : (
                                            ing.nome_ingrediente
                                        )}
                                    </td>

                                    <td>
                                        {editingId === ing.id ? (
                                            <input
                                                type="number"
                                                value={editedPrezzo}
                                                onChange={(e) => setEditedPrezzo(parseFloat(e.target.value))}
                                                className="edit-input"
                                            />
                                        ) : (
                                            `${ing.prezzo.toFixed(2)} €`
                                        )}
                                    </td>

                                    <td>
                                        {editingId === ing.id ? (
                                            <input
                                                type="number"
                                                value={editedQuantita}
                                                onChange={(e) => setEditedQuantita(parseInt(e.target.value))}
                                                className="edit-input"
                                            />
                                        ) : (
                                            ing.quantita
                                        )}
                                    </td>

                                    <td>
                                        {editingId === ing.id ? (
                                            <>
                                                <button
                                                    className="save-btn"
                                                    onClick={() => ing.id && saveEdit(ing.id)}
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
                                                    onClick={() => startEdit(ing)}
                                                >
                                                    Modifica
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => ing.id && handleDelete(ing.id)}
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