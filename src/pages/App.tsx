import { Routes as QuickRoutes } from "../types";
import { HowToPlay } from "./HowToPlay";
import { Splash } from "./Splash";
import { GameContainer } from "./Game";
import { NavigationContextProvider } from "../components/NavigationContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { Section } from "../components/Section";

export const App = () => {
  return (
    <>
      <Section>
        <Router>
          <NavigationContextProvider>
            <Routes>
              <Route path={QuickRoutes.Splash} element={<Splash />} />
              <Route path={QuickRoutes.HowToPlay} element={<HowToPlay />} />
              <Route path={QuickRoutes.Game} element={<GameContainer />} />
              <Route path="/game/:roomId" element={<GameContainer />} />
              <Route
                path="*"
                element={<Navigate to={QuickRoutes.Splash} replace />}
              />
            </Routes>
          </NavigationContextProvider>
        </Router>
      </Section>
    </>
  );
};
