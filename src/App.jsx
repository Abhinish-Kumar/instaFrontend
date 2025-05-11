import './App.css'
import {BrowserRouter as Router,Routes,Route, Link} from "react-router-dom"
import Register from './Register'
import Login from './Login'
import Dashboard from './Dashboard'

/**
 * 
 *   You’re using <Link> incorrectly — target='register' is not valid. You should use to='/register'.

✅ You are using Component={Register} inside <Route>. In React Router v6, you should use element={<Register />} instead.

✅ You probably want the <Link> inside the <Router> so it works with the routing system.

Here’s the corrected working version of your code:
 */
function App() {
  

  return (
    <>
    
    <Router>
      {/* //all thing related to route should be in Reouter */}
      <nav>
          <Link to='/register'>Register</Link> 
          <Link to='/login'>Login</Link>
          <Link to='/instaFrontend/dashboard'>Dashboard</Link>
        </nav>
      <Routes>
        <Route path='/register' element={<Register/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>
    </Router>
     {/* <h1>kjcas</h1> */}
    </>
  )
}

export default App
