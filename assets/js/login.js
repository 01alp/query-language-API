// Index page login
const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const usernameOrEmail = form.elements['username-or-email'].value;
  const password = form.elements['password'].value;
  localStorage.setItem('username', usernameOrEmail);
  localStorage.setItem('password', password);

  const url = 'https://01.kood.tech/api/auth/signin';

  // Credentials must be base64 encoded with btoa()
  const info = usernameOrEmail + ':' + password;
  const credentials = btoa(info);

  // Send POST request to obtain a JWT
  fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + credentials,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((data) => {
      // Extract the JWT from the response
      const jwt = data;

      // VVerify JWT
      if (jwt && jwt.length > 0) {
        // Then redirect to home page
        window.location.href = 'home.html';
      } else {
        // Show an error message if the JWT is invalid
        const errorMessage = 'Invalid Username or password';
        document.getElementById('error-message').textContent = errorMessage;
        console.error(errorMessage);
      }
    })
    .catch((error) => console.error(error));
});
