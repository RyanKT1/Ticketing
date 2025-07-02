import CreateTicketPage from './pages/create-ticket.page';
import DevicePage from './pages/device-table.page';
import { Route, Routes } from 'react-router-dom';



function App() {

  return (
    <>
      <main className='main-content'>
      
        <Routes>
          <Route path="/ticket/create" element={<CreateTicketPage/>}/>
            <Route path="/" element={<DevicePage/>}/>
        </Routes>
            
      </main>
    </>
  )
}

export default App
