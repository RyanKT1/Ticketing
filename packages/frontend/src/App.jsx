import CreateDevicePage from './pages/create-device.page';
import CreateTicketPage from './pages/create-ticket.page';
import DeviceTablePage from './pages/device-table.page';
import { Route, Routes } from 'react-router-dom';
import NavBar from './components/navigation-bar/navigation-bar';
import Header from './components/header/header.component';
import HomePage from './pages/home.page';
import TicketPage from './pages/ticket.page';
import TicketManagementPage from './pages/ticket-management.page';
import CognitoAuthentication from './components/cognito-authentication/cognito-authentication.component';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <CognitoAuthentication>
      {({ signOutRedirect }) => (
        <div className="app-container">
          <Header />
          <div className="content-page">
            <aside className="sidebar">
              <NavBar onSignOut={signOutRedirect} />
            </aside>
            <main className="main-content">
              <Routes>
                <Route index element={<HomePage />} />
                <Route path='device'>
                  <Route path="create" element={<CreateDevicePage />} />
                  <Route path='table' element={<DeviceTablePage />} />
                </Route>
                <Route path='ticket'>
                  <Route path="create" element={<CreateTicketPage />} />
                  <Route path="create/:deviceId" element={<CreateTicketPage />} />
                  <Route path="info/:id" element={<TicketPage />} />
                  <Route path="management" element={<TicketManagementPage />} />
                </Route>
              </Routes>
            </main>
          </div>
        </div>
      )}
    </CognitoAuthentication>
  );
}

export default App;
