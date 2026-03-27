import './SelectorType.css';
import { useNavigate } from "react-router";

export function SelectorType() {
    const navigate = useNavigate();
    
    return (
        <>
            <button onClick={() => navigate("/admin/articoli")} className="admin-mode-button">
                Articoli
            </button>
            <button onClick={() => navigate("/admin/categorie")} className="admin-mode-button">
                Categorie
            </button>
            <button onClick={() => navigate("/admin/ingredienti")} className="admin-mode-button">
                Ingredienti
            </button>
            <button onClick={() => navigate("/admin/sconti")} className="admin-mode-button">
                Sconti
            </button>
            <button onClick={() => navigate("/admin/zone")} className="admin-mode-button">
                Zone
            </button>
        </>
    );
}