import { useState, useEffect } from 'react';
import axios from 'axios';
import './CategoriePage.css';

interface Categoria {
    id?: number;
    nome_categoria: string;
    visibile: boolean;
}

export function CategoriePage() {
    const [nome, setNome] = useState<string>('');
    const [visibile, setVisibile] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);

    // Stato per la lista delle categorie
    const [categorie, setCategorie] = useState<Categoria[]>([]);

    const API_URL = 'http://localhost:5000/api/categorie';

    // Funzione per caricare le categorie
    const fetchCategorie = async () => {
        try {
            const response = await axios.get(API_URL);
            setCategorie(response.data);
        } catch (err) {
            handleAxiosError(err, "Errore nel caricamento categorie");
        }
    };

    useEffect(() => {
        fetchCategorie();
    }, []);

    // Gestore errori centralizzato (mantiene la tua logica)
    const handleAxiosError = (err: unknown, defaultMsg: string) => {
        let messaggioErrore = defaultMsg;
        if (axios.isAxiosError(err)) {
            messaggioErrore = err.response?.data?.errore || messaggioErrore;
        }
        alert(messaggioErrore);
    };

    const handleInsert = async () => {
        if (!nome.trim()) {
            alert("Il nome è obbligatorio");
            return;
        }

        setLoading(true);
        try {
            const nuovaCategoria: Categoria = { nome_categoria: nome, visibile };
            await axios.post(API_URL, nuovaCategoria);

            setNome('');
            setVisibile(true);
            fetchCategorie(); // Refresh della lista
            alert("Categoria inserita!");
        } catch (err) {
            handleAxiosError(err, "Errore durante l'invio");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questa categoria?")) return;

        try {
            await axios.delete(`${API_URL}/${id}`);
            fetchCategorie();
        } catch (err) {
            handleAxiosError(err, "Errore durante l'eliminazione");
        }
    };

    const toggleVisibile = async (cat: Categoria) => {
        try {
            await axios.put(`${API_URL}/${cat.id}`, {
                visibile: !cat.visibile
            });
            fetchCategorie();
        } catch (err) {
            handleAxiosError(err, "Errore durante l'aggiornamento");
        }
    };

    return (
        <div className="categorie-page-container">
            <div className="categorie-input-container">
                <h3>Nuova Categoria</h3>
                <label>Nome:</label>
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome categoria"
                />

                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={visibile}
                        onChange={(e) => setVisibile(e.target.checked)}
                    />
                    Visibile
                </label>

                <button onClick={handleInsert} disabled={loading}>
                    {loading ? 'Inserimento...' : 'Inserisci'}
                </button>
            </div>

            <div className="categorie-display-container">
                <h3>Elenco Categorie</h3>
                <div className="scrollable-table-wrapper">
                    <table className="categorie-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Stato</th>
                                <th>Azioni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categorie.map((cat) => (
                                <tr key={cat.id}>
                                    <td>{cat.id}</td>
                                    <td>{cat.nome_categoria}</td>
                                    <td>
                                        <button
                                            className={`status-badge ${cat.visibile ? 'v-on' : 'v-off'}`}
                                            onClick={() => toggleVisibile(cat)}
                                        >
                                            {cat.visibile ? 'Visibile' : 'Nascosta'}
                                        </button>
                                    </td>
                                    <td>
                                        <button
                                            className="delete-btn"
                                            onClick={() => cat.id && handleDelete(cat.id)}
                                        >
                                            Elimina
                                        </button>
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