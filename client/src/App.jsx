import {BrowserRouter as Router, Route,Routes} from 'react-router-dom'
import * as Pages from './pages'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Pages.Home />} />
        <Route path="*" element={<Pages.NotFoundPage />} />
        <Route path="/login" element={<Pages.LoginPage />} />
        <Route path="/signup" element={<Pages.SignUpPage />} />
        <Route path="/student" element={<Pages.StudentDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
