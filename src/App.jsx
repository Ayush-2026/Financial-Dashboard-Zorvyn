import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./store/ThemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Transactions from "./pages/Transactions";
import Insights from "./pages/Insights";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/analytics" element={<Insights />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
