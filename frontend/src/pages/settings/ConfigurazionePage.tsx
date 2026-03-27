import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ConfigurazionePage.css';

interface Configurazione {
    id?: number;
    nome_sagra: string;
    password?: string;
    costo_coperto?: number;
    costo_asporto?: number;
    quantita_soglia?: number;
    area?: string;
    cassa?: string;
    usa_smartphone_tavoli: boolean;
    usa_monitor_cucina: boolean;
}

export function ConfigurazionePage() {
    const [config, setConfig] = useState<Configurazione>({
        nome_sagra: '',
        password: '',
        costo_coperto: undefined,
        costo_asporto: undefined,
        quantita_soglia: undefined,
        area: '',
        cassa: '',
        usa_smartphone_tavoli: false,
        usa_monitor_cucina: false,
    });

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const API_CONFIG = 'http://localhost:5000/api/configurazione';

    const fetchConfigurazione = useCallback(async () => {
        try {
            const response = await axios.get(API_CONFIG);
            if (response.data.length > 0) {
                setConfig(response.data[0]);
            }
        } catch (err) {
            handleAxiosError(err, "Errore nel caricamento configurazione");
        } finally {
            setFetching(false);
        }
    }, []);

    useEffect(() => {
        fetchConfigurazione();
    }, [fetchConfigurazione]);

    const handleAxiosError = (err: unknown, defaultMsg: string) => {
        let messaggioErrore = defaultMsg;
        if (axios.isAxiosError(err)) {
            messaggioErrore = err.response?.data?.errore || messaggioErrore;
        }
        alert(messaggioErrore);
    };

    const handleChange = (field: keyof Configurazione, value: Configurazione[keyof Configurazione]) => {
        setConfig({ ...config, [field]: value });
    };

    const handleSave = async () => {
        // VALIDAZIONE
        if (
            !config.nome_sagra ||
            !config.password ||
            config.costo_coperto === undefined ||
            config.costo_asporto === undefined ||
            config.quantita_soglia === undefined ||
            !config.area ||
            !config.cassa
        ) {
            alert("Compila tutti i campi prima di salvare!");
            return;
        }

        // CONFERMA
        if (!window.confirm("Sei sicuro di voler salvare la configurazione?")) return;

        setLoading(true);

        try {
            if (config.id) {
                await axios.put(`${API_CONFIG}/${config.id}`, config);
                alert("Configurazione aggiornata con successo!");
            } else {
                const response = await axios.post(API_CONFIG, config);
                setConfig(response.data);
                alert("Configurazione creata con successo!");
            }
        } catch (err) {
            handleAxiosError(err, "Errore durante il salvataggio configurazione");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div>Caricamento configurazione...</div>;

    return (
        <div className="configurazione-page-container">
            <h2>Impostazioni Sagra</h2>

            <div className="configurazione-form">
                <div className="form-group">
                    <label>Nome Sagra:</label>
                    <input
                        type="text"
                        placeholder="Inserisci nome sagra"
                        value={config.nome_sagra || ''}
                        onChange={(e) => handleChange('nome_sagra', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        placeholder="Inserisci password"
                        value={config.password || ''}
                        onChange={(e) => handleChange('password', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Costo Coperto:</label>
                    <input
                        type="number"
                        placeholder="Inserisci costo coperto"
                        value={config.costo_coperto ?? ''}
                        onChange={(e) =>
                            handleChange(
                                'costo_coperto',
                                e.target.value ? parseFloat(e.target.value) : undefined
                            )
                        }
                    />
                </div>

                <div className="form-group">
                    <label>Costo Asporto:</label>
                    <input
                        type="number"
                        placeholder="Inserisci costo asporto"
                        value={config.costo_asporto ?? ''}
                        onChange={(e) =>
                            handleChange(
                                'costo_asporto',
                                e.target.value ? parseFloat(e.target.value) : undefined
                            )
                        }
                    />
                </div>

                <div className="form-group">
                    <label>Quantità Soglia:</label>
                    <input
                        type="number"
                        placeholder="Inserisci quantità soglia"
                        value={config.quantita_soglia ?? ''}
                        onChange={(e) =>
                            handleChange(
                                'quantita_soglia',
                                e.target.value ? parseInt(e.target.value) : undefined
                            )
                        }
                    />
                </div>

                <div className="form-group">
                    <label>Area:</label>
                    <input
                        type="text"
                        placeholder="Inserisci area"
                        value={config.area || ''}
                        onChange={(e) => handleChange('area', e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Cassa:</label>
                    <input
                        type="text"
                        placeholder="Inserisci cassa"
                        value={config.cassa || ''}
                        onChange={(e) => handleChange('cassa', e.target.value)}
                    />
                </div>

                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={config.usa_smartphone_tavoli}
                        onChange={(e) =>
                            handleChange('usa_smartphone_tavoli', e.target.checked)
                        }
                    />
                    Usa smartphone per i tavoli
                </label>

                <label className="checkbox-label">
                    <input
                        type="checkbox"
                        checked={config.usa_monitor_cucina}
                        onChange={(e) =>
                            handleChange('usa_monitor_cucina', e.target.checked)
                        }
                    />
                    Usa monitor in cucina
                </label>

                <button onClick={handleSave} disabled={loading}>
                    {loading ? 'Salvataggio...' : 'Salva Configurazione'}
                </button>
            </div>
        </div>
    );
}