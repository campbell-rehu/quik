import { Routes as QuikRoutes } from '../types'
import { HowToPlay } from './HowToPlay'
import { Splash } from './Splash'
import { GameContainer } from './Game'
import { NavigationContextProvider } from '../components/NavigationContext'
import { ErrorBoundary } from '../components/ErrorBoundary'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import './App.css'
import { Section } from '../components/Section'

export const App = () => {
  return (
    <ErrorBoundary>
      <Section>
        <Router>
          <NavigationContextProvider>
            <Routes>
              <Route path={QuikRoutes.Splash} element={<Splash />} />
              <Route path={QuikRoutes.HowToPlay} element={<HowToPlay />} />
              <Route path={QuikRoutes.Game} element={<GameContainer />} />
              <Route path='/game/:roomId' element={<GameContainer />} />
              <Route
                path='*'
                element={<Navigate to={QuikRoutes.Splash} replace />}
              />
            </Routes>
          </NavigationContextProvider>
        </Router>
      </Section>
    </ErrorBoundary>
  )
}
