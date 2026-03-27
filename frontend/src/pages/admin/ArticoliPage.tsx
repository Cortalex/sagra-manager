//import { Header } from '../../components/Header';
import './ArticoliPage.css';
//import { useEffect, useState } from "react";
//import axios from 'axios';

//nome_articolo, prezzo, id_categoria, id_zona

export function ArticoliPage() {

    return (
        <div className="articoli-page-container">

            <div className="top-interface-container">
                <div>
                    Nome:
                    <input />
                </div>

                <div>
                    Prezzo:
                    <input />
                </div>

                <div>
                    Categoria:
                    <select>
                        <option>

                        </option>

                    </select>
                </div>

                <button>Inserisci</button>
            </div>
        </div>
    );
}