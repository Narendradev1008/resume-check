import {createBrowserRouter} from 'react-router'
import Login from './features/auth/pages/Login.jsx'
import Register from './features/auth/pages/Register.jsx'
import Protected from './features/auth/components/Protected.jsx'
import Home from "./features/ai/pages/Home.jsx"
import Interview from './features/ai/pages/Interview.jsx'

const router=createBrowserRouter([
  {
    path:'/login',
    element: <Login/>
  },
  {
    path:'/register',
    element: <Register/>
  },
  {
    path:'/',
    element:<Protected><Home/></Protected>
  },
  {
    path:'/interview/:interviewid',
    element:<Protected><Interview/></Protected>
  }
])
export default router;
