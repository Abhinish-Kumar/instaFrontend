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
          <Link to='instaFrontend/register'>Register</Link> 
          <Link to='instaFrontend/login'>Login</Link>
          <Link to='instaFrontend/dashboard'>Dashboard</Link>
        </nav>
      <Routes>
        <Route path='instaFrontend/register' element={<Register/>}/>
        <Route path='instaFrontend/login' element={<Login/>}/>
        <Route path='instaFrontend/dashboard' element={<Dashboard/>}/>
      </Routes>
    </Router>
     {/* <h1>kjcas</h1> */}
    </>
  )
}

export default App
