import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./components/Dashboard/Dashboard";
import PortfolioPage from "./components/Portfolio/PortfolioPage";
import NewsPage from "./components/News/NewsPage";
import StockPage from "./components/Stocks/StockPage";
import StockDetail from "./components/Stocks/StockDetail";
import ChatPage from "./components/Chat/ChatPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/stocks" element={<StockPage />} />
        <Route path="/stocks/:ticker" element={<StockDetail />} />
      </Route>
    </Routes>
  );
}
