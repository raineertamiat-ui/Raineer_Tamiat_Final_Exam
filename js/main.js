// Handle registration submission
if (document.getElementById('regForm')) {
    document.getElementById('regForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentData = {
            student_id: document.getElementById('student_id').value,
            full_name: document.getElementById('full_name').value,
            course: document.getElementById('course').value,
            year_level: document.getElementById('year_level').value,
            email_address: document.getElementById('email_address').value,
        };

        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        const data = await res.json();
        if(res.ok) { alert(data.message); window.location.href = '/students-page'; }
        else { alert(data.error); }
    });
}

// Fetch all records for the dynamic table
async function fetchStudents() {
    const res = await fetch('/api/students');
    const students = await res.json();
    const tbody = document.getElementById('studentTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    
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
