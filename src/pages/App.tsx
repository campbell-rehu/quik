import { Routes as QuickRoutes } from '../types'
import { Lobby } from './Lobby'
import { Splash } from './Splash'
import { GameContainer } from './Game'
import { NavigationContextProvider } from '../components/NavigationContext'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'

export const App = () => {
  return (
    <Router>
      <NavigationContextProvider>
        <Routes>
          <Route path={QuickRoutes.Splash} element={<Splash />} />
          <Route path={QuickRoutes.Lobby} element={<Lobby />} />
          <Route path={QuickRoutes.Game} element={<GameContainer />} />
          <Route
            path='*'
            element={<Navigate to={QuickRoutes.Splash} replace />}
          />
        </Routes>
      </NavigationContextProvider>
    </Router>
  )
}
