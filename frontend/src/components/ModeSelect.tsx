import { useNavigate, useLocation } from "react-router";
import './ModeSelect.css';

export const ModeSelect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const modeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;

    if (selected === "home") navigate("/");
    if (selected === "settings") navigate("/settings");
    if (selected === "admin") navigate("/admin");
  };

  const getValueFromPath = () => {
    if (location.pathname === "/") return "home";
    if (location.pathname.startsWith("/settings")) return "settings";
    if (location.pathname.startsWith("/admin")) return "admin";
    return "home";
  };

  return (
    <select
      value={getValueFromPath()}
      onChange={modeChange}
      className="mode-selector"
    >
      <option value="home">Home</option>
      <option value="settings">Settings</option>
      <option value="admin">Admin</option>
    </select>
  );
};