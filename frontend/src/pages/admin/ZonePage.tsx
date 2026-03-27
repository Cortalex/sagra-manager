import { useState, useEffect } from 'react';
import axios from 'axios';
import './ZonePage.css';

interface Zona {
    id?: number;
    nome_zona: string;
}

export function ZonePage() {
    const [nome, setNome] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [zone, setZone] = useState<Zona[]>([]);

    // 🔹 stati edit
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedName, setEditedName] = useState<string>('');

    const API_URL = 'http://localhost:5000/api/zone';

    const fetchZone = async () => {
        try {
            const res = await axios.get(API_URL);
            setZone(res.data);
        } catch (err) {
            handleAxiosError(err, "Errore nel caricamento zone");
        }
    };

    useEffect(() => {
        fetchZone();
    }, []);

    const handleAxiosError = (err: unknown, defaultMsg: string) => {
        let msg = defaultMsg;
        if (axios.isAxiosError(err)) {
            msg = err.response?.data?.errore || msg;
        }
        alert(msg);
    };

    const handleInsert = async () => {
        if (!nome.trim()) {
            alert("Il nome è obbligatorio");
            return;
        }

        setLoading(true);
        try {
            await axios.post(API_URL, { nome_zona: nome });

            setNome('');
            fetchZone();
            alert("Zona inserita!");
        } catch (err) {
            handleAxiosError(err, "Errore inserimento");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Sei sicuro di eliminare questa zona?")) return;

        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchZone();
        } catch (err) {
            handleAxiosError(err, "Errore eliminazione");
        }
    };

    // 🔹 EDIT
    const startEdit = (zona: Zona) => {
        setEditingId(zona.id || null);
        setEditedName(zona.nome_zona);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditedName('');
    };

    const saveEdit = async (id: number) => {
        if (!editedName.trim()) {
            alert("Il nome è obbligatorio");
            return;
        }

        try {
            await axios.put(`${API_URL}/${id}`, {
                nome_zona: editedName
            });

            setEditingId(null);
            setEditedName('');
            fetchZone();
        } catch (err) {
            handleAxiosError(err, "Errore modifica");
        }
    };

    return (
        <div className="zone-page-container">
            <div className="zone-input-container">
                <h3>Nuova Zona</h3>

                <label>Nome:</label>
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome zona"
                />

                <button onClick={handleInsert} disabled={loading}>
                    {loading ? 'Inserimento...' : 'Inserisci'}
                </button>
            </div>

            <div className="zone-display-container">
                <h3>Elenco Zone</h3>

                <table className="zone-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Azioni</th>
                        </tr>
                    </thead>

                    <tbody>
                        {zone.map((zona) => (
                            <tr key={zona.id}>
                                <td>{zona.id}</td>

                                <td>
                                    {editingId === zona.id ? (
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className='edit-input'
                                        />
                                    ) : (
                                        zona.nome_zona
                                    )}
                                </td>

                                <td>
                                    {editingId === zona.id ? (
                                        <>
                                            <button
                                                className="save-btn"
                                                onClick={() => zona.id && saveEdit(zona.id)}
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
                                                onClick={() => startEdit(zona)}
                                            >
                                                Modifica
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => zona.id && handleDelete(zona.id)}
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
    );
}