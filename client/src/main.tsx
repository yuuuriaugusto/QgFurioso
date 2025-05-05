/**
 * QG FURIOSO - Entrada Principal do Frontend
 * 
 * Este é o ponto de entrada da aplicação, responsável por renderizar o componente raiz.
 * 
 * @version 2.5.0
 * @author Equipe QG FURIOSO
 * @copyright FURIA Esports 2025
 */

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
