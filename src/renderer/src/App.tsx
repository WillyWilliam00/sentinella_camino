import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import About from "./components/About";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>

    </BrowserRouter>
  )
}

export default App;