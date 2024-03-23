import {BrowserRouter as Router, Route,Routes} from 'react-router-dom'
import * as Pages from './pages'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Pages.Home />} />
        <Route path="*" element={<Pages.NotFound />} />
        <Route path="/login" element={<Pages.LoginPage />} />
        <Route path="/signup" element={<Pages.SignUpPage />} />
      </Routes>
    </Router>
  )
}

export default App
