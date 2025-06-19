import { useState } from 'react'
import Button from 'react-bootstrap/Button';
import DevicePage from './pages/device-table.page';
import { Route, Routes } from 'react-router-dom';


function App() {

  return (
    <>
  
      <p> Hi</p>
      <Button>hello</Button>
      <main className='main-content'>
        <Routes>
            <Route path="/" element={<DevicePage/>}/>
        </Routes>
            
      </main>
    </>
  )
}

export default App
