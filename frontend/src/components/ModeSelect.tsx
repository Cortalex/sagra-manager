import React, { useState } from "react";
import { useNavigate } from "react-router";
import './ModeSelect.css';

export const ModeSelect: React.FC = () => {
  const [value, setValue] = useState<string>("home");
  const navigate = useNavigate();

  const modeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setValue(selected);

    console.log("Selezionato:", selected);

    // navigazione
    if (selected === "home") navigate("/");
    if (selected === "settings") navigate("/settings");
    if (selected === "admin") navigate("/admin");
  };

  return (
    <select 
      value={value} 
      onChange={modeChange}
      className="mode-selector"
    >
      <option value="home">Home</option>
      <option value="settings">Settings</option>
      <option value="admin">Admin</option>
    </select>
  );
};