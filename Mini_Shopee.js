const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("login-message");
const loginBtn = document.getElementById("login-btn");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  loginMessage.textContent = "Memeriksa akun...";
  loginMessage.classList.remove("error");
  loginBtn.disabled = true;

  try {
    const response = await fetch("https://dummyjson.com/users");
    const data = await response.json();

    const user = data.users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      localStorage.setItem("firstName", user.firstName);
      loginMessage.textContent = "Login berhasil! Mengalihkan...";
      window.location.href = "index.html"; // sementara, diganti di tahap katalog
    } else {
      loginMessage.textContent = "Username atau password salah.";
      loginMessage.classList.add("error");
    }
  } catch (error) {
    loginMessage.textContent = "Gagal terhubung ke server. Coba lagi.";
    loginMessage.classList.add("error");
  } finally {
    loginBtn.disabled = false;
  }
});
