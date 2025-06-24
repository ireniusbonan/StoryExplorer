export default class StoryListView {
  constructor({ stories = [], onDetail }) {
    this.stories = stories;
    this.onDetail = onDetail;
    this.container = null;
    this._handleClick = this._handleClick.bind(this); // Pastikan event handler terikat ke instance
  }

  getTemplate() {
    // Pesan untuk saat tidak ada cerita
    if (!this.stories || this.stories.length === 0) {
      return `
        <section aria-live="polite" aria-label="Daftar cerita kosong">
          <h2>Daftar Cerita</h2>
          <p>Tidak ada cerita untuk ditampilkan saat ini.</p>
          <p>Silakan <a href="#/add">tambahkan cerita baru</a> untuk memulai!</p>
        </section>
      `;
    }

    // Template untuk menampilkan daftar cerita
    return `
      <section aria-label="Daftar cerita" role="main">
        <h2>Daftar Cerita</h2>
        <ul class="story-list" style="list-style:none; padding:0;">
          ${this.stories
            .map(
              (story) => `
            <li class="story-item" style="margin-bottom:24px; border-bottom:1px solid #eee; padding-bottom:16px;">
              <img 
                src="${story.photoUrl || story.photo}" 
                alt="Foto cerita dari ${story.name || "Anonim"}" 
                style="max-width:100%; border-radius:12px; margin-bottom:0.5rem; aspect-ratio: 16/9; object-fit: cover;" 
              />
              <h3 style="margin-top:0.5rem; margin-bottom:0.25rem;">${
                story.name || "Anonim"
              }</h3>
              <p style="font-size:0.9rem; color:#666; margin-bottom:0.5rem;">
                ${story.description.substring(0, 100)}${
                story.description.length > 100 ? "..." : ""
              }
              </p>
              <small style="display:block; margin-bottom:1rem; color:#888;">${new Date(
                story.createdAt
              ).toLocaleDateString("id-ID", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</small>
              <button 
                class="detail-btn btn-primary-small" 
                data-id="${story.id}" 
                aria-label="Lihat detail cerita ${story.name || "Anonim"}"
                type="button"
                style="padding: 0.5rem 1rem; font-size: 0.9rem; border-radius: 8px; background-color: #007bff; color: white; border: none; cursor: pointer; transition: background-color 0.3s ease;"
              >
                Lihat Detail
              </button>
            </li>
          `
            )
            .join("")}
        </ul>
      </section>
    `;
  }

  render(container) {
    this.container = container;
    container.innerHTML = this.getTemplate();
    this._bindEvents();
  }

  _bindEvents() {
    if (!this.container) return; // Pastikan container ada
    // Delegasi event untuk tombol detail
    this.container.addEventListener("click", this._handleClick);
  }

  _handleClick(event) {
    // Periksa apakah elemen yang diklik adalah tombol detail
    if (event.target.classList.contains("detail-btn")) {
      const id = event.target.dataset.id; // Ambil ID cerita dari data-attribute
      if (this.onDetail) this.onDetail(id); // Panggil callback ke Presenter
    }
  }

  showStories(stories) {
    this.stories = stories;
    this.render(this.container); // Render ulang view dengan data cerita baru
  }

  showStoryLoadError(message) {
    if (!this.container) return;
    this.container.innerHTML = `
      <section aria-live="assertive" aria-label="Error memuat cerita">
        <h2>Daftar Cerita</h2>
        <p style="color: red;">${message}</p>
        <p>Coba <a href="#/stories">muat ulang daftar cerita</a>.</p>
      </section>
    `;
  }

  destroy() {
    if (!this.container) return;
    // Hapus event listener untuk mencegah memory leaks
    this.container.removeEventListener("click", this._handleClick);
    this.container.innerHTML = ""; // Bersihkan konten DOM
  }
}
