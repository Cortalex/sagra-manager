import { useState, useEffect } from 'react';
import axios from 'axios';
import './ScontiPage.css';

interface Sconto {
    id?: number;
    nome_sconto: string;
    valore: number;
    tipo: string;
    data_inizio?: string;
    data_fine?: string;
}

export function ScontiPage() {
    const [nome, setNome] = useState<string>('');
    const [valore, setValore] = useState<number>(0);
    const [tipo, setTipo] = useState<string>('%');
    const [dataInizio, setDataInizio] = useState<string>('');
    const [dataFine, setDataFine] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const [sconti, setSconti] = useState<Sconto[]>([]);

    // 🔹 stati per modifica
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedSconto, setEditedSconto] = useState<Partial<Sconto>>({});

    const API_URL = 'http://localhost:5000/api/sconti';

    const fetchSconti = async () => {
        try {
            const response = await axios.get(API_URL);
            setSconti(response.data);
        } catch (err) {
            handleAxiosError(err, "Errore nel caricamento sconti");
        }
    };

    useEffect(() => {
        fetchSconti();
    }, []);

    const handleAxiosError = (err: unknown, defaultMsg: string) => {
        let messaggioErrore = defaultMsg;
        if (axios.isAxiosError(err)) {
            messaggioErrore = err.response?.data?.errore || messaggioErrore;
        }
        alert(messaggioErrore);
    };

    // 🔹 INSERT
    const handleInsert = async () => {
        if (!nome.trim() || !tipo.trim()) {
            alert("Nome e tipo sono obbligatori");
            return;
        }

        setLoading(true);
        try {
            const nuovoSconto: Sconto = {
                nome_sconto: nome,
                valore,
                tipo,
                data_inizio: dataInizio || undefined,
                data_fine: dataFine || undefined,
            };

            await axios.post(API_URL, nuovoSconto);

            // Reset input
            setNome('');
            setValore(0);
            setTipo('%');
            setDataInizio('');
            setDataFine('');

            fetchSconti();
            alert("Sconto inserito!");
        } catch (err) {
            handleAxiosError(err, "Errore durante l'inserimento");
        } finally {
            setLoading(false);
        }
    };

    // 🔹 DELETE
    const handleDelete = async (id: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo sconto?")) return;

        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchSconti();
        } catch (err) {
            handleAxiosError(err, "Errore durante l'eliminazione");
        }
    };

    // 🔹 EDIT
    const startEdit = (sconto: Sconto) => {
        setEditingId(sconto.id || null);
        setEditedSconto({ ...sconto });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditedSconto({});
    };

    const saveEdit = async (id: number) => {
        if (!editedSconto.nome_sconto || !editedSconto.tipo) {
            alert("Nome e tipo sono obbligatori");
            return;
        }

        try {
            await axios.put(`${API_URL}/${id}`, editedSconto);
            setEditingId(null);
            setEditedSconto({});
            fetchSconti();
        } catch (err) {
            handleAxiosError(err, "Errore durante la modifica");
        }
    };

    return (
        <div className="sconti-page-container">
            <div className="categorie-input-container">
                <h3>Nuovo Sconto</h3>

                <label>Nome:</label>
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome sconto"
                />

                <label>Valore:</label>
                <input
                    type="number"
                    value={valore}
                    onChange={(e) => setValore(Number(e.target.value))}
                    placeholder="Valore sconto"
                />

                <label>Tipo:</label>
                <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                    <option value="%">%</option>
                    <option value="€">€</option>
                </select>

                <label>Data Inizio:</label>
                <input
                    type="date"
                    value={dataInizio}
                    onChange={(e) => setDataInizio(e.target.value)}
                />

                <label>Data Fine:</label>
                <input
                    type="date"
                    value={dataFine}
                    onChange={(e) => setDataFine(e.target.value)}
                />

                <button onClick={handleInsert} disabled={loading}>
                    {loading ? 'Inserimento...' : 'Inserisci'}
                </button>
            </div>

            <div className="categorie-display-container">
                <h3>Elenco Sconti</h3>

                <div className="scrollable-table-wrapper">
                    <table className="categorie-table">
                        <thead>
                            <tr>
                                <th className="col-id">ID</th>
                                <th className="col-nome">Nome</th>
                                <th className="col-valore">Valore</th>
                                <th className="col-tipo">Tipo</th>
                                <th className="col-data">Data Inizio</th>
                                <th className="col-data">Data Fine</th>
                                <th className="col-azioni">Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sconti.map((s) => (
                                <tr key={s.id}>
                                    <td className="col-id">{s.id}</td>

                                    <td className="col-nome">
                                        {editingId === s.id ? (
                                            <input
                                                type="text"
                                                value={editedSconto.nome_sconto || ''}
                                                onChange={(e) =>
                                                    setEditedSconto((prev) => ({ ...prev, nome_sconto: e.target.value }))
                                                }
                                                className="edit-input"
                                            />
                                        ) : (
                                            s.nome_sconto
                                        )}
                                    </td>

                                    <td className="col-valore">
                                        {editingId === s.id ? (
                                            <input
                                                type="number"
                                                value={editedSconto.valore || 0}
                                                onChange={(e) =>
                                                    setEditedSconto((prev) => ({ ...prev, valore: Number(e.target.value) }))
                                                }
                                                className="edit-input"
                                            />
                                        ) : (
                                            s.valore
                                        )}
                                    </td>

                                    <td className="col-tipo">
                                        {editingId === s.id ? (
                                            <select
                                                value={editedSconto.tipo || '%'}
                                                onChange={(e) =>
                                                    setEditedSconto((prev) => ({ ...prev, tipo: e.target.value }))
                                                }
                                                className="edit-input"
                                            >
                                                <option value="%">%</option>
                                                <option value="€">€</option>
                                            </select>
                                        ) : (
                                            s.tipo
                                        )}
                                    </td>

                                    <td className="col-data">
                                        {editingId === s.id ? (
                                            <input
                                                type="date"
                                                value={editedSconto.data_inizio || ''}
                                                onChange={(e) =>
                                                    setEditedSconto((prev) => ({ ...prev, data_inizio: e.target.value }))
                                                }
                                                className="edit-input"
                                            />
                                        ) : (
                                            s.data_inizio ? new Date(s.data_inizio).toLocaleDateString() : '-'
                                        )}
                                    </td>

                                    <td className="col-data">
                                        {editingId === s.id ? (
                                            <input
                                                type="date"
                                                value={editedSconto.data_fine || ''}
                                                onChange={(e) =>
                                                    setEditedSconto((prev) => ({ ...prev, data_fine: e.target.value }))
                                                }
                                                className="edit-input"
                                            />
                                        ) : (
                                            s.data_fine ? new Date(s.data_fine).toLocaleDateString() : '-'
                                        )}
                                    </td>

                                    <td className="col-azioni">
                                        {editingId === s.id ? (
                                            <>
                                                <button className="save-btn" onClick={() => s.id && saveEdit(s.id)}>Salva</button>
                                                <button className="cancel-btn" onClick={cancelEdit}>Annulla</button>
                                            </>
                                        ) : (
                                            <>
                                                <button className="edit-btn" onClick={() => startEdit(s)}>Modifica</button>
                                                <button className="delete-btn" onClick={() => s.id && handleDelete(s.id)}>Elimina</button>
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