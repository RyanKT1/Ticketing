import { useState } from 'react'
import Button from 'react-bootstrap/Button';
import DevicePage from './pages/device-table.page';
import { Route, Routes } from 'react-router-dom';
import { Header } from './components/header/header.component';


function App() {

  return (
    <>

      <main className='main-content'>
      
        <Routes>
            <Route path="/" element={<DevicePage/>}/>
        </Routes>
            
      </main>
    </>
  )
}

export default App
