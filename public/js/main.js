// Handle registration submission
document.addEventListener('DOMContentLoaded', () => {
    const regForm = document.getElementById('regForm');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const studentData = {
                student_id: document.getElementById('student_id').value,
                full_name: document.getElementById('full_name').value,
                course: document.getElementById('course').value,
                year_level: document.getElementById('year_level').value,
                email_address: document.getElementById('email_address').value,
            };

            try {
                const res = await fetch('/api/students', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(studentData)
                });
                const data = await res.json();
                if (res.ok) { 
                    alert(data.message || 'Student registered successfully!'); 
                    window.location.href = '/students-page'; 
                } else { 
                    alert('Error: ' + (data.error || 'Failed to register student.')); 
                }
            } catch (err) {
                console.error(err);
                alert('Network connection failure. Check your server status.');
            }
        });
    }
});

// Fetch all records for the dynamic table
async function fetchStudents() {
    try {
        const res = await fetch('/api/students');
        if (!res.ok) {
            const data = await res.json();
            alert('Failed to load students: ' + (data.error || 'Server error'));
            return;
        }
        const students = await res.json();
        const tbody = document.getElementById('studentTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #7f8c8d;">No student records found in the database.</td></tr>`;
            return;
        }
        
        students.forEach(student => {
            tbody.innerHTML += `
                <tr>
                    <td>${student.student_id}</td>
                    <td>${student.full_name}</td>
                    <td>${student.course}</td>
                    <td>${student.year_level}</td>
                    <td>${student.email_address}</td>
                    <td>
                        <button class="btn-edit" onclick="goToEdit(${student.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteStudent(${student.id})">Delete</button>
                    </td>
                </tr>
            `;
        });
    } catch (err) {
        console.error(err);
        const tbody = document.getElementById('studentTableBody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Failed to connect to backend server.</td></tr>`;
    }
}

function goToEdit(id) { 
    window.location.href = `/edit-page?id=${id}`; 
}

// Populate values inside the Update View
async function populateEditForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) return;

    try {
        const res = await fetch(`/api/students/${id}`);
        if (!res.ok) return alert('Could not find that specific student record.');
        const student = await res.json();

        if (document.getElementById('edit_student_id')) {
            document.getElementById('edit_student_id').value = student.student_id;
            document.getElementById('edit_full_name').value = student.full_name;
            document.getElementById('edit_course').value = student.course;
            document.getElementById('edit_year_level').value = student.year_level;
            document.getElementById('edit_email_address').value = student.email_address;
        }

        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.onsubmit = async (e) => {
                e.preventDefault();
                const updatedData = {
                    student_id: document.getElementById('edit_student_id').value,
                    full_name: document.getElementById('edit_full_name').value,
                    course: document.getElementById('edit_course').value,
                    year_level: document.getElementById('edit_year_level').value,
                    email_address: document.getElementById('edit_email_address').value,
                };

                const updateRes = await fetch(`/api/students/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });
                if (updateRes.ok) { 
                    alert('Record updated successfully!'); 
                    window.location.href = '/students-page'; 
                } else {
                    const data = await updateRes.json();
                    alert('Update failed: ' + (data.error || 'Server error'));
                }
            };
        }
    } catch (err) {
        console.error(err);
    }
}

// Delete Request Management 
async function deleteStudent(id) {
    if (confirm('Are you absolutely sure you want to drop this student record?')) {
        try {
            const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
            if (res.ok) { 
                alert('Record deleted successfully'); 
                fetchStudents(); 
            } else {
                const data = await res.json();
                alert('Delete failed: ' + (data.error || 'Server error'));
            }
        } catch (err) {
            alert('Could not complete delete action due to connection loss.');
        }
    }
}                <td>${student.course}</td>
                <td>${student.year_level}</td>
                <td>${student.email_address}</td>
                <td>
                    <button class="btn-edit" onclick="goToEdit(${student.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteStudent(${student.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

function goToEdit(id) { window.location.href = `/edit-page?id=${id}`; }

// Populate values inside the Update View
async function populateEditForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) return;

    const res = await fetch(`/api/students/${id}`);
    const student = await res.json();

    document.getElementById('edit_student_id').value = student.student_id;
    document.getElementById('edit_full_name').value = student.full_name;
    document.getElementById('edit_course').value = student.course;
    document.getElementById('edit_year_level').value = student.year_level;
    document.getElementById('edit_email_address').value = student.email_address;

    // Attach handler dynamically to capture standard submission event
    document.getElementById('editForm').onsubmit = async (e) => {
        e.preventDefault();
        const updatedData = {
            student_id: document.getElementById('edit_student_id').value,
            full_name: document.getElementById('edit_full_name').value,
            course: document.getElementById('edit_course').value,
            year_level: document.getElementById('edit_year_level').value,
            email_address: document.getElementById('edit_email_address').value,
        };

        const updateRes = await fetch(`/api/students/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        });
        if (updateRes.ok) { alert('Record updated successfully!'); window.location.href = '/students-page'; }
    };
}

// Delete Request Management 
async function deleteStudent(id) {
    if (confirm('Are you absolutely sure you want to drop this student record?')) {
        const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
        if (res.ok) { alert('Record deleted successfully'); fetchStudents(); }
    }
  }
