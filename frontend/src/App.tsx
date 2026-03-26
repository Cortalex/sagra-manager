//import axios from 'axios';
//import { getApiUrl } from '../src/utils/config';
//import { Articolo } from '../src/utils/types';
import './App.css';
import { Route, Routes } from 'react-router';
import { HomePage } from './pages/home/HomePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { AdminPage } from './pages/admin/AdminPage';
import { Header } from './components/Header';

function App() {

  return (
    <>
      <Header />
      <Routes>
          <Route path="/" element={<HomePage />}/>
          <Route path="/settings" element={<SettingsPage />}/>
          <Route path="/admin" element={<AdminPage />}/>
      </Routes>
    </>
  )
}

export default App
