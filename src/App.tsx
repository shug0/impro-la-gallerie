import { BrowserRouter, Route, Routes } from "react-router-dom";
import Gallery from "./pages/Gallery";
import Home from "./pages/Home";

export default function App() {
  return (
    <div className="bg-black">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
