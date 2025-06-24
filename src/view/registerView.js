export default class RegisterView {
  constructor({ onRegister, onGoToLogin }) {
    this.onRegister = onRegister;
    this.onGoToLogin = onGoToLogin;
    this.container = null;
  }

  getTemplate() {
    return `
      <section class="auth-container" aria-labelledby="register-title">
        <h2 id="register-title">Daftar ke StoryExplorer</h2>
        <form id="registerForm" novalidate autocomplete="off" aria-describedby="register-note">
          <div class="form-group">
            <label for="name">Nama Lengkap</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required 
              placeholder="Masukkan nama lengkap Anda" 
              aria-required="true"
              autocomplete="name"
            />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              placeholder="contoh@email.com" 
              aria-required="true"
              autocomplete="email"
            />
          </div>
          <div class="form-group">
            <label for="password">Kata Sandi</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              minlength="6" 
              placeholder="Minimal 6 karakter" 
              aria-required="true"
              autocomplete="new-password"
            />
          </div>
          <div id="message" role="alert" aria-live="assertive" style="margin-bottom: 12px;"></div>
          <button type="submit" class="btn-primary">Daftar</button>
        </form>
        <p id="register-note" class="form-note">
          Sudah punya akun? <a href="#" id="goToLogin">Login di sini</a>
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
    const form = this.container.querySelector("#registerForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value.trim();
      this.clearMessage();
      this.onRegister({ name, email, password });
    });

    const goToLoginLink = this.container.querySelector("#goToLogin");
    goToLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      this.onGoToLogin();
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
