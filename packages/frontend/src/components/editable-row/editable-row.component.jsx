import Button from 'react-bootstrap/Button';

function EditableRow({ editFormData, handleEditInputChange, handleCancelClick }){

    return(
        <tr >
                    <td><input
                        type="text"
                        placeholder="Enter device name"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditInputChange}
                    ></input></td>
                    <td><input
                        type="text"
                        placeholder="Enter device manufacturer "
                        name="manufacturer"
                        value={editFormData.manufacturer}
                        onChange={handleEditInputChange}
                    ></input></td>
                    <td><input
                        type="text"
                        placeholder="Enter device model "
                        name="model"
                        value={editFormData.model}
                        onChange={handleEditInputChange}
                    ></input></td>
                    <td><input
                        type="date"
                        placeholder="Enter new created at date"
                        name="createdAt"
                        value={editFormData.createdAt}
                        onChange={handleEditInputChange}
                    ></input></td>
                    <td><input
                        type="date"
                        placeholder="Enter new updated at date"
                        name="updatedAt"
                        value={editFormData.updatedAt}
                        onChange={handleEditInputChange}
                    ></input></td>
                    <td>
                        <Button variant="primary" size="sm" type="submit">Save</Button>
                        <Button variant="primary" size="sm" onClick={handleCancelClick}>Cancel </Button>
                    </td>
                </tr>
    )
}

export default EditableRow
