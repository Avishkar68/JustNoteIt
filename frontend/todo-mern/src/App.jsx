import React from 'react'
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'

import Home from './page/Home/Home'
import Login from './page/Login/Login'
import SignUp from './page/SignUp/SignUp'

const routes = (
  <Router>
    <Routes>
      <Route path='/dashboard' exact element={<Home />} />
      <Route path='/login' exact element={<Login />} />
      <Route path='/' exact element={<Login />} />
      <Route path='/signup' exact element={<SignUp />} />
    </Routes>
  </Router>
)

const App = () => {
  return (
    <div>
      {routes}
    </div>
  )
}

export default App