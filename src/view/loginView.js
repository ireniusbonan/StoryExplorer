export default class LoginView {
  constructor({ onLogin, onGoToRegister }) {
    this.onLogin = onLogin;
    this.onGoToRegister = onGoToRegister;
    this.container = null;
  }

  getTemplate() {
    return `
      <section class="auth-container" aria-labelledby="login-title">
        <h2 id="login-title">Masuk ke StoryExplorer</h2>
        <form id="loginForm" novalidate autocomplete="off" aria-describedby="login-note">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              placeholder="Masukkan email Anda" 
              autocomplete="username"
              aria-required="true"
            />
          </div>
          <div class="form-group">
            <label for="password">Kata Sandi</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              placeholder="Masukkan kata sandi" 
              autocomplete="current-password"
              aria-required="true"
            />
          </div>
          <div id="message" role="alert" aria-live="assertive" style="margin-bottom: 12px;"></div>
          <button type="submit" class="btn-primary">Masuk</button>
        </form>
        <p id="login-note" class="form-note">
          Belum punya akun? <a href="#" id="goToRegister">Daftar di sini</a>
        </p>
      </section>
    `;
  }

  render(container) {
    this.container = container;
    container.innerHTML = this.getTemplate();
    this._bindEvents();
  }

  _bindEvents() {
    const form = this.container.querySelector("#loginForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const email = form.email.value.trim();
      const password = form.password.value.trim();
      this.clearMessage();
      this.onLogin({ email, password });
    });

    const goToRegisterLink = this.container.querySelector("#goToRegister");
    goToRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.onGoToRegister();
    });
  }

  showError(message) {
    const messageEl = this.container.querySelector("#message");
    messageEl.textContent = message;
    messageEl.style.color = "red";
  }

  showSuccess(message) {
    const messageEl = this.container.querySelector("#message");
    messageEl.textContent = message;
    messageEl.style.color = "green";
  }

  clearMessage() {
    const messageEl = this.container.querySelector("#message");
    messageEl.textContent = "";
  }

  navigateTo(hash) {
    location.hash = hash;
  }

  destroy() {
    if (this.container) {
      this.container.innerHTML = "";
    }
  }
}
