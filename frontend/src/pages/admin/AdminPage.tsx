//import { ModeSelect } from "../../components/ModeSelect";
import { ArticoliPage } from './ArticoliPage';
import { CategoriePage } from './CategoriePage';
import { IngredientiPage } from './IngredientiPage';
import { ScontiPage } from './ScontiPage';
import { ZonePage } from './ZonePage';
import { Route, Routes, Link } from 'react-router'

export function AdminPage() {

    return (
        <>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <Link to="articoli"><button>Articoli</button></Link>
                <Link to="categorie"><button>Categorie</button></Link>
                <Link to="ingredienti"><button>Ingredienti</button></Link>
                <Link to="sconti"><button>Sconti</button></Link>
                <Link to="zone"><button>Zone</button></Link>
            </div>
            <Routes>
                <Route path="articoli" element={<ArticoliPage />} />
                <Route path="categorie" element={<CategoriePage />} />
                <Route path="ingredienti" element={<IngredientiPage />} />
                <Route path="sconti" element={<ScontiPage />} />
                <Route path="zone" element={<ZonePage />} />
            </Routes>
        </>
    );
}