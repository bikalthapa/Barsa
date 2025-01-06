// // Handle update confirmation
// document.getElementById('confirmUpdateButton').addEventListener('click', function () {
//     if (confirm("Do you really want to update this item?")) {
//         // Perform the update operation here (e.g., make an API call)
//         alert("Item updated!");
//         // Close the modal
//         var modalElement = document.getElementById('updateModal');
//         var modalInstance = bootstrap.Modal.getInstance(modalElement);
//         modalInstance.hide();
//     }
// });
// // Handle delete confirmation
// document.getElementById('confirmDeleteButton').addEventListener('click', function () {
//     if (confirm("Do you really want to delete this item?")) {
//         // Perform the delete operation here (e.g., make an API call)
//         alert("Item deleted!");
//         // Close the modal

//     }
// });
var addModal = document.getElementById('studentModal');
var addModalInstance = bootstrap.Modal.getInstance(addModal);

var deleteModal = document.getElementById('deleteModal');
var deleteModalInstance = bootstrap.Modal.getInstance(deleteModal);
var confirmDelete = document.getElementById("confirmDeleteButton");
var delIndx = 0;

let addStudentForm = document.getElementById('studentForm');
let fetched_data = [];
let searchBar = document.getElementById('searchBar');
let field = {
    add: {
        id: ['studentName', 'studentContact', 'studentEmail', 'studentDOB', 'studentGender'],
        require: [true, false, true, false, false],
        element: []
    }
};

// Fetching the backend API for students
const onFetchSuccess = (data) => {
    const tableBody = document.getElementById('studentTableBody');
    if (data.status == "success") {
        fetched_data = data.data;
        tableBody.innerHTML = '';  // Clear existing rows
        data.data.forEach((student, indx) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${student.s_id}</th>
                <td>${student.s_name}</td>
                <td>${student.s_contact}</td>
                <td>${student.s_email}</td>
                <td>${student.s_dob}</td>
                <td>${student.s_isverified}</td>
                <td class="d-flex justify-content-center gap-4">
                    <div class="dropstart">
                        <div type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <img src="../Icons/three_dots.svg" />
                        </div>
                        <ul class="dropdown-menu">
                            <li>
                                <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#updateModal">
                                    <img src="../Icons/edit.svg" />&nbsp;&nbsp; Update
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" onclick="setDeleteData(${indx})" data-bs-toggle="modal" data-bs-target="#deleteModal">
                                    <img src="../Icons/delete.svg" /> Delete
                                </a>
                            </li>
                        </ul>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No data found</td></tr>';
    }

    hideSpinner();
};
// Handle the error for fetching the backend API for students
const onFetchError = (error) => {
    console.error(error);
}


// Handle the success for adding a student
const onAddSuccess = (data) => {
    backend.getStudents((fdata) => {
        onFetchSuccess(fdata);
        hideSpinner();
    }, onFetchError);
    addModalInstance.hide();
}
// Handle the error for adding a student
const onAddError = (error) => {
    console.error(error);
}



// Handles the delete success operation
const onDeleteSuccess = (data)=>{
    backend.getStudents(onFetchSuccess, onFetchError);
    deleteModalInstance.hide();
    hideSpinner();
}
// Handles the delete error operation
const onDeleteError = (error)=>{
    console.error(error);
}




showSpinner();
backend.getStudents(onFetchSuccess, onFetchError);

// This function will set the index of the student to be deleted
function setDeleteData(indx){
    delIndx = indx;
    document.getElementById("deletePerson").innerHTML = `Are you sure you want to delete ${fetched_data[indx].s_name} from the record ?`;
}


// Add the student on form submit
addStudentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let addFieldData = field.add;
    let isValid = true;
    field.add.id.forEach((field, indx) => {
        addFieldData.element[indx] = new InputValidator(document.getElementById(field));
        if (addFieldData.require[indx] || !addFieldData.element[indx].field.value.trim() === "") {
            addFieldData.element[indx].validateField();
            let validation = addFieldData.element[indx].validateField();
            document.getElementById(field).addEventListener('input', () => {
                addFieldData.element[indx].validateField();
            });
            if (!validation) {
                isValid = false;
            }
        }
    });

    if (isValid) {// Upload the data if it is valid
        let data = {
            name: encodeURIComponent(field.add.element[0].field.value),
            contact: encodeURIComponent(field.add.element[1].field.value),
            email: encodeURIComponent(field.add.element[2].field.value),
            dob: encodeURIComponent(field.add.element[3].field.value)
        };
        showSpinner();
        backend.setStudent(data, onAddSuccess, onAddError);
    }
    // showSpinner();
    addStudentForm.reset();
});

// Search for a student
searchBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
        e.preventDefault(); // Prevent the default action of the Enter key
        let searchValue = searchBar.value;
        let data = {};
        if (searchValue.trim() !== "") {
            showSpinner();
            data.query = searchValue;
            backend.searchStudent(data, onFetchSuccess, onFetchError);
        }
    }
});

// Confirm the delete operation
confirmDelete.addEventListener('click', () => {
    showSpinner();
    backend.deleteStudent({s_id:fetched_data[delIndx].s_id}, onDeleteSuccess, onDeleteError);
});

