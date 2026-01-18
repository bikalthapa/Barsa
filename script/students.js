var addModal = document.getElementById('upModal');
var addModalInstance = bootstrap.Modal.getInstance(addModal);
if (!addModalInstance) {
    addModalInstance = new bootstrap.Modal(addModal);
}
var upTitle = document.getElementById('upTitle');
var deleteModal = document.getElementById('deleteModal');
var deleteModalInstance = bootstrap.Modal.getInstance(deleteModal);
if (!deleteModalInstance) {
    deleteModalInstance = new bootstrap.Modal(deleteModal);
}
var confirmDelete = document.getElementById("confirmDeleteButton");
let studentForm = document.getElementById('upStdForm');
let searchBar = document.getElementById('searchBar');


var delIndx = 0;// Index of the student to be deleted 
var upIndx = 0; // Index of the student to be updated
var studentMode = true; // True for add and false for update
let fetched_data = [];// Holds the value of fetched data
let field = {
    id: ['s_name', 's_contact', 's_email', 's_dob','fingerprint_id','s_gender'],
    require: [true, false, true, false, false, false],
    element: []
}

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
                <td>${student.s_dob!="0000-00-00"?student.s_dob:""}</td>
                <td>${student.s_gender!=null?student.s_gender:""}</td>
                <td class="d-flex justify-content-center gap-4">
                    <div class="dropstart">
                        <div type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-three-dots-vertical"></i>
                        </div>
                        <ul class="dropdown-menu">
                            <li>
                                <a class="dropdown-item" onclick="enrollFingerPrint(${indx})">
                                    <i class="bi bi-fingerprint"></i> Enroll Fingerprint
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#attandanceHistoryModal">
                                    <i class="bi bi-person-lines-fill"></i> Attandance Histroy
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" onclick="setUpdateData(${indx})" data-bs-toggle="modal" data-bs-target="#upModal">
                                    <i class="bi bi-pencil-square"></i>&nbsp;&nbsp; Update
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item text-danger" onclick="setDeleteData(${indx})" data-bs-toggle="modal" data-bs-target="#deleteModal">
                                    <i class="bi bi-trash"></i> Delete
                                </a>
                            </li>
                        </ul>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } else {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center">No data found</td></tr>';
    }

    hideSpinner();
};

// Handle the error for fetching the backend API for students
const onFetchError = (error) => {
    console.error(error);
    const tableBody = document.getElementById('studentTableBody');
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-danger">Error loading students: ' + error.message + '</td></tr>';
    hideSpinner();
};

// Handle the success for adding a student
const onAddSuccess = (data) => {
    studentForm.reset();
    backend.getStudents((fdata) => {
        onFetchSuccess(fdata);
        hideSpinner();
    }, onFetchError);
    addModalInstance.hide();
};

// Handle the error for adding a student
const onAddError = (error) => {
    console.error(error);
};

// Handles the delete success operation
const onDeleteSuccess = (data) => {
    backend.getStudents(onFetchSuccess, onFetchError);
    deleteModalInstance.hide();
    hideSpinner();
};

// Handles the delete error operation
const onDeleteError = (error) => {
    console.error(error);
};

showSpinner();
backend.getStudents(onFetchSuccess, onFetchError);

// This function will set the index of the student to be deleted onclick
function setDeleteData(indx) {
    delIndx = indx;
    document.getElementById("deletePerson").innerHTML = `<span>Are you sure you want to delete <b>${fetched_data[indx].s_name}</b> from the record ?</span>`;
}
// This function will set the index of the student to be updated onclick
function setUpdateData(indx) {
    upIndx = indx;
    studentMode = false;
    upTitle.innerHTML = "Update Student";
    field.id.forEach((fieldId) => {
        document.getElementById(fieldId).value = fetched_data[upIndx][fieldId];
    });
}
// Function to enroll fingerprint
function enrollFingerPrint(indx){
    // console.log("Enrolling fingerprint for student:", fetched_data[indx]);
    backend.enrollFingerPrint({ s_id: fetched_data[indx].s_id }, (data) => {
        console.log("Fingerprint enrollment started:", data);
        hideSpinner();
    }, (error) => {
        console.error("Error enrolling fingerprint:", error);
        hideSpinner();
    });

}
// This function will set the add student form to default
function setAddData() {
    studentMode = true;
    upTitle.innerHTML = "Add Student";
    field.id.forEach((fieldId) => {
        document.getElementById(fieldId).value = "";
    });
}
// Add the student on form submit
// Ensure the event listener is attached only once
if (!studentForm.hasAttribute('data-listener-attached')) {
    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        field.id.forEach((fieldId, indx) => {
            field.element[indx] = new InputValidator(document.getElementById(fieldId));
            if (field.require[indx] || !field.element[indx].field.value.trim() === "") {
                field.element[indx].validateField();
                let validation = field.element[indx].validateField();
                document.getElementById(fieldId).addEventListener('input', () => {
                    field.element[indx].validateField();
                });
                if (!validation) {
                    isValid = false;
                }
            }
        });

        if (isValid) { // Upload the data if it is valid
            let data = {
                s_id: "",
                name: encodeURIComponent(field.element[0].field.value),
                contact: encodeURIComponent(field.element[1].field.value),
                email: encodeURIComponent(field.element[2].field.value),
                dob: encodeURIComponent(field.element[3].field.value),
                finger: encodeURIComponent(field.element[4].field.value),
                gender: encodeURIComponent(field.element[5].field.value)
            };
            showSpinner();
            if (studentMode==true) { // Add mode
                backend.setStudent(data, onAddSuccess, onAddError);
            } else {
                data.s_id = fetched_data[upIndx].s_id;
                backend.updateStudent(data, onAddSuccess, onAddError);
            }
        }
    });

    // Mark that the event listener has been attached
    studentForm.setAttribute('data-listener-attached', 'true');
}
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
    backend.deleteStudent({ s_id: fetched_data[delIndx].s_id }, onDeleteSuccess, onDeleteError);
});