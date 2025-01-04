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
//         var modalElement = document.getElementById('exampleModal');
//         var modalInstance = bootstrap.Modal.getInstance(modalElement);
//         modalInstance.hide();
//     }
// });

let addStudentForm = document.getElementById('studentForm');
let fieldsId = ['studentName', 'studentContact', 'studentEmail', 'studentDOB'];


// Fetching the backend API for students
const onSuccess = (data) => {
    const tableBody = document.getElementById('studentTableBody');
    tableBody.innerHTML = '';  // Clear existing rows
    data.data.forEach(student => {
        console.log(student);
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
                                <a class="dropdown-item" data-bs-toggle="modal" data-bs-target="#exampleModal">
                                    <img src="../Icons/delete.svg" /> Delete
                                </a>
                            </li>
                        </ul>
                    </div>
                </td>
            `;
        tableBody.appendChild(row);
    });
    hideSpinner();
};

const onError = (error) => {
    console.error(error);
}

showSpinner();
backend.getStudents(onSuccess, onError);



// Add the student on form submit
addStudentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const studentName = document.getElementById('studentName').value;
    const studentContact = document.getElementById('studentContact').value;
    const studentEmail = document.getElementById('studentEmail').value;
    const studentDOB = document.getElementById('studentDOB').value;
    // backend.addStudent(studentName, studentContact, studentEmail, studentDOB, onSuccess, onError);
    showSpinner();
    addStudentForm.reset();
});
