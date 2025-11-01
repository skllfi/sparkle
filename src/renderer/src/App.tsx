import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./App.css";

import TitleBar from "@/components/titlebar";
import Nav from "@/components/nav";
import Rootdiv from "@/components/rootdiv";
import Home from "@/pages/Home";
import Tweaks from "@/pages/Tweaks";
import Clean from "@/pages/Clean";
import Apps from "@/pages/Apps";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/Notfound";
import DNS from "@/pages/DNS";
import Backup from "@/pages/Backup";
import Utilities from "@/pages/Utilities";

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
