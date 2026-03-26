import './SelectorType.css';

export function SelectorType() {
    return (
        <div>
            <button className="admin-mode-button">Articoli</button>
            <button className="admin-mode-button">Categorie</button>
            <button className="admin-mode-button">Ingredienti</button>
            <button className="admin-mode-button">Sconti</button>
            <button className="admin-mode-button">Zone</button>
        </div>
    );
}