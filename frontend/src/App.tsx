//import axios from 'axios';
//import { getApiUrl } from '../src/utils/config';
//import { Articolo } from '../src/utils/types';
import './App.css';
import { Route, Routes } from 'react-router';
//import { useState } from 'react';
import { HomePage } from './pages/home/HomePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { AdminPage } from './pages/admin/AdminPage';
import { ArticoliPage } from './pages/admin/ArticoliPage';
import { CategoriePage } from './pages/admin/CategoriePage';
import { IngredientiPage } from './pages/admin/IngredientiPage';
import { ScontiPage } from './pages/admin/ScontiPage';
import { ZonePage } from './pages/admin/ZonePage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/admin" element={<AdminPage />}>
          <Route path="articoli" element={<ArticoliPage />} />
          <Route path="categorie" element={<CategoriePage />} />
          <Route path="ingredienti" element={<IngredientiPage />} />
          <Route path="sconti" element={<ScontiPage />} />
          <Route path="zone" element={<ZonePage />} />
        </Route>
        <Route path="/*" element={<NotFoundPage />}></Route>
      </Routes>
    </>
  )
}

export default App
