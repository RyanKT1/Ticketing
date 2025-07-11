import Table from 'react-bootstrap/Table';
import EditableRow from '../editable-row/editable-row.component';
import ReadonlyRow from '../readonly-row/readonly-row.component';
import { Fragment } from 'react';
import { Form } from 'react-bootstrap';

function DevicesTable({
  deviceList = [],
  editDeviceRow,
  editFormData,
  handleDeleteDevice,
  handleUpdateClick,
  handleEditInputChange,
  handleEditFormSubmit,
  handleCancelClick,
  handleCreateTicket,
  isAdmin,
}) {
  return (
    <Form onSubmit={handleEditFormSubmit}>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Manufacturer</th>
            <th>Model</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {deviceList &&
            deviceList.map(device => (
              <Fragment key={device.id}>
                {editDeviceRow === device.id ? (
                  <EditableRow
                    editFormData={editFormData}
                    handleEditInputChange={handleEditInputChange}
                    handleCancelClick={handleCancelClick}
                  />
                ) : (
                  <ReadonlyRow
                    device={device}
                    handleDeleteDevice={handleDeleteDevice}
                    handleUpdateDevice={handleUpdateClick}
                    handleCreateTicket={handleCreateTicket}
                    isAdmin={isAdmin}
                  />
                )}
              </Fragment>
            ))}
          <tr key="empty-row">
            <td colSpan="6"></td>
          </tr>
        </tbody>
      </Table>
    </Form>
  );
}

export default DevicesTable;
