async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const url = 'http://localhost:5678/api/users/login';
    const requestBody = JSON.stringify({
        email: email,
        password: password
    });
  
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
            },
            body: requestBody
        });
  
        if (response.ok) {
            const data = await response.json();
            const token = data.token;
            console.log('Token:', token);
            // vvvvvvvvUTILSIER TOKEN
            localStorage.setItem('token', token);
            window.location.href = '../html/index.html';
            // ^^^^^^^^
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.message;
            console.log('Error:', errorMessage);
        }
    } catch (error) {
        console.log('Error:', error.message);
    }
}