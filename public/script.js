document.addEventListener('DOMContentLoaded', () => {
    const username = getCookie('username');
    if (!username || !localStorage.getItem('isVerified')) {
        document.getElementById('content-frame').src = 'https://example.com'; // URL predeterminada
    } else {
        fetchIframeUrl();
        fetchNotes();
    }

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'o') {
            event.preventDefault();
            document.getElementById('password-panel').classList.remove('hidden');
        }
    });
});

function verifyPassword() {
    const password = document.getElementById('password-input').value;
    const username = document.getElementById('username-input').value;
    fetch('/verify-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'password=' + encodeURIComponent(password) + '&username=' + encodeURIComponent(username)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('isVerified', 'true');
            document.getElementById('password-panel').classList.add('hidden');
            fetchIframeUrl();
            fetchNotes();
        } else {
            alert('Contraseña incorrecta');
        }
    });
}

function changeIframeUrl() {
    const url = document.getElementById('url-input').value;
    if (url) {
        document.getElementById('content-frame').src = url;
        saveIframeUrl(url);
        document.getElementById('url-panel').classList.add('hidden');
    } else {
        alert('Por favor, ingresa una URL válida');
    }
}

function fetchIframeUrl() {
    fetch('/get-url')
        .then(response => response.text())
        .then(url => {
            document.getElementById('content-frame').src = url;
        });
}

function saveIframeUrl(url) {
    fetch('/save-url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'url=' + encodeURIComponent(url)
    });
}

function fetchNotes() {
    fetch('/get-notes')
        .then(response => response.text())
        .then(notes => {
            document.getElementById('notes-input').value = notes;
        });
}

function saveNotes() {
    const notes = document.getElementById('notes-input').value;
    fetch('/save-notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'notes=' + encodeURIComponent(notes)
    }).then(response => {
        if (response.ok) {
            alert('Notas guardadas correctamente');
        } else {
            alert('Error guardando las notas');
        }
    });
}

function loadUsers() {
    fetch('/get-users')
        .then(response => response.text())
        .then(data => {
            const users = data.split('\n').filter(u => u);
            const userManagementDiv = document.getElementById('user-management');
            userManagementDiv.innerHTML = '';
            users.forEach(user => {
                const userDiv = document.createElement('div');
                userDiv.textContent = user;
                const removeButton = document.createElement('button');
                removeButton.textContent = 'Desverificar';
                removeButton.onclick = () => removeUser(user);
                userDiv.appendChild(removeButton);
                userManagementDiv.appendChild(userDiv);
            });
        });
}

function removeUser(username) {
    fetch('/remove-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'username=' + encodeURIComponent(username)
    }).then(response => {
        if (response.ok) {
            alert('Usuario desverificado');
            loadUsers();
        } else {
            alert('Error desverificando el usuario');
        }
    });
}

function closePanel(panelId) {
    document.getElementById(panelId).classList.add('hidden');
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
