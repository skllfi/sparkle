import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

import TitleBar from "@/components/titlebar.jsx";
import Nav from "@/components/nav.tsx";
import Rootdiv from "@/components/rootdiv.jsx";
import Home from "@/pages/Home.tsx";
import Tweaks from "@/pages/Tweaks.tsx";
import Clean from "@/pages/Clean.tsx";
import Apps from "@/pages/Apps.tsx";
import Settings from "@/pages/Settings.tsx";
import NotFound from "@/pages/Notfound.tsx";
import DNS from "@/pages/DNS.tsx";
import Backup from "@/pages/Backup.tsx";
import Utilities from "@/pages/Utilities.tsx";

function App() {
  return (
    <>
      <ToastContainer
        position="bottom-right"
        theme="dark"
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Router>
        <TitleBar />
        <Rootdiv>
          <Nav />
          <main className="ml-20 h-full w-full bg-transparent p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tweaks" element={<Tweaks />} />
              <Route path="/clean" element={<Clean />} />
              <Route path="/apps" element={<Apps />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dns" element={<DNS />} />
              <Route path="/backup" element={<Backup />} />
              <Route path="/utilities" element={<Utilities />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </Rootdiv>
      </Router>
    </>
  );
}

export default App;
