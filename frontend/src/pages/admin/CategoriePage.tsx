//import { Header } from '../../components/Header';
import { useState } from 'react';
import axios from 'axios';

interface Categoria {
    id?: number;
    nome_categoria: string;
    visibile: boolean;
}

export function CategoriePage() {
    const [nome, setNome] = useState<string>('');
    const [visibile, setVisibile] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);

    const handleInsert = async () => {
        if (!nome.trim()) {
            alert("Il nome è obbligatorio");
            return;
        }

        setLoading(true);
        try {
            const nuovaCategoria: Categoria = {
                nome_categoria: nome,
                visibile: visibile
            };

            // Sostituisci l'URL con quello del tuo server
            const response = await axios.post('http://localhost:5000/api/categorie', nuovaCategoria);

            console.log("Inserito con successo:", response.data);
            alert("Categoria inserita!");

            // Reset dei campi dopo l'invio
            setNome('');
            setVisibile(true);
        } catch (err: unknown) {
            let messaggioErrore = "Errore durante l'invio";

            if (axios.isAxiosError(err)) {
                messaggioErrore = err.response?.data?.errore || messaggioErrore;
            }

            alert(messaggioErrore);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="categorie-page-container">
                <title>Admin @ Categorie</title>

                <h3>Aggiungi Nuova Categoria</h3>

                <label>Nome:</label>
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome categoria"
                />

                <label>
                    <input
                        type="checkbox"
                        checked={visibile}
                        onChange={(e) => setVisibile(e.target.checked)}
                    />
                    Visibile
                </label>

                <button onClick={handleInsert} disabled={loading}>
                    {loading ? 'Inserimento in corso...' : 'Inserisci'}
                </button>
            </div>
        </>
    );
}