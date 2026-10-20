import { useEffect } from "react";
import "@/App.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CartographyPage from "@/pages/CartographyPage";
import { Toaster } from "sonner";

function App() {
  useEffect(() => {
    document.title = "Cartographie 3D · Lons-le-Saunier";
  }, []);

  return (
    <div className="App font-body">
      <BrowserRouter basename={process.env.PUBLIC_URL || undefined}>
        <Routes>
          <Route path="/" element={<CartographyPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}

export default App;
