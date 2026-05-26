const API_URL = '/api/students';

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('studentTableBody')) {
        loadStudents();
    }
    if (document.getElementById('editStudentForm')) {
        loadStudentToEdit();
    }
});

// READ ALL
async function loadStudents() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        const tbody = document.getElementById('studentTableBody');
        const emptyState = document.getElementById('emptyState');
        
        tbody.innerHTML = '';
        
        if (students.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }
        
        if (emptyState) emptyState.classList.add('hidden');
        
        students.forEach(student => {
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-white/5 transition-colors border-b border-white/5';
            tr.innerHTML = `
                <td class="px-6 py-4 font-mono font-medium text-indigo-400">${student.student_id}</td>
                <td class="px-6 py-4 text-white font-medium">${student.full_name}</td>
                <td class="px-6 py-4">${student.course}</td>
                <td class="px-6 py-4"><span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-300">${student.year_level}</span></td>
                <td class="px-6 py-4 text-gray-400">${student.email_address}</td>
                <td class="px-6 py-4 text-right space-x-3">
                    <a href="/edit?id=${student.id}" class="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors">Edit</a>
                    <button onclick="deleteStudent(${student.id})" class="text-sm text-rose-400 hover:text-rose-300 font-medium transition-colors">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Failure reading data rows:', error);
    }
}

// CREATE
async function handleRegister(event) {
    event.preventDefault();
    const studentData = {
        student_id: document.getElementById('student_id').value,
        full_name: document.getElementById('full_name').value,
        course: document.getElementById('course').value,
        year_level: document.getElementById('year_level').value,
        email_address: document.getElementById('email_address').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });

        if (response.ok) {
            window.location.href = '/list';
        } else {
            const err = await response.json();
            alert('Error creating record: ' + err.error);
        }
    } catch (error) {
        console.error(error);
    }
}

// EDIT POPULATE
async function loadStudentToEdit() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) return;

    try {
        const response = await fetch(`${API_URL}/${id}`);
        const student = await response.json();

        document.getElementById('formId').value = student.id;
        document.getElementById('student_id').value = student.student_id;
        document.getElementById('full_name').value = student.full_name;
        document.getElementById('course').value = student.course;
        document.getElementById('year_level').value = student.year_level;
        document.getElementById('email_address').value = student.email_address;
    } catch (error) {
        console.error('Error pulling row map:', error);
    }
}

// UPDATE
async function handleEdit(event) {
    event.preventDefault();
    const id = document.getElementById('formId').value;
    
    const studentData = {
        student_id: document.getElementById('student_id').value,
        full_name: document.getElementById('full_name').value,
        course: document.getElementById('course').value,
        year_level: document.getElementById('year_level').value,
        email_address: document.getElementById('email_address').value
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });

        if (response.ok) {
            window.location.href = '/list';
        } else {
            const err = await response.json();
            alert('Update error trace: ' + err.error);
        }
    } catch (error) {
        console.error(error);
    }
}

// DELETE
async function deleteStudent(id) {
    if (!confirm('Are you sure you want to permanently delete this student record?')) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (response.ok) {
            loadStudents();
        } else {
            alert('Failed execution drop sequence.');
        }
    } catch (error) {
        console.error(error);
    }
}