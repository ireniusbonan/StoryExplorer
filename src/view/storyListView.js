export default class StoryListView {
  constructor({ stories = [], onDetail, onSave }) {
    this.stories = stories;
    this.onDetail = onDetail;
    this.onSave = onSave;
    this.container = null;
    this._handleClick = this._handleClick.bind(this);
  }

  getTemplate() {
    if (!this.stories || this.stories.length === 0) {
      return `
        <section aria-live="polite" aria-label="Daftar cerita kosong">
          <h2>Daftar Cerita</h2>
          <p>Tidak ada cerita untuk ditampilkan saat ini.</p>
          <p>Silakan <a href="#/add">tambahkan cerita baru</a> untuk memulai!</p>
        </section>
      `;
    }

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
              <h3 style="margin-top:0.5rem; margin-bottom:0.25rem;">
                ${story.name || "Anonim"}
              </h3>
              <p style="font-size:0.9rem; color:#666; margin-bottom:0.5rem;">
                ${story.description.substring(0, 100)}${
                story.description.length > 100 ? "..." : ""
              }
              </p>
              <small style="display:block; margin-bottom:1rem; color:#888;">
                ${new Date(story.createdAt).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </small>

              <div style="display: flex; gap: 0.5rem;">
                <button 
                  class="detail-btn btn-primary-small" 
                  data-id="${story.id}" 
                  aria-label="Lihat detail cerita ${story.name || "Anonim"}"
                  type="button"
                  style="padding: 0.5rem 1rem; font-size: 0.9rem; border-radius: 8px; background-color: #007bff; color: white; border: none; cursor: pointer;">
                  Lihat Detail
                </button>

                <button 
                  class="save-btn btn-secondary-small" 
                  data-id="${story.id}" 
                  aria-label="Simpan cerita ${
                    story.name || "Anonim"
                  } untuk dibaca offline"
                  type="button"
                  style="padding: 0.5rem 1rem; font-size: 0.9rem; border-radius: 8px; background-color: #28a745; color: white; border: none; cursor: pointer;">
                  💾 Simpan Offline
                </button>
              </div>
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
    if (!this.container) return;
    this.container.addEventListener("click", this._handleClick);
  }

  _handleClick(event) {
    const detailBtn = event.target.closest(".detail-btn");
    const saveBtn = event.target.closest(".save-btn");

    if (detailBtn) {
      const id = detailBtn.dataset.id;
      if (this.onDetail) this.onDetail(id);
    }

    if (saveBtn) {
      const id = saveBtn.dataset.id;
      if (this.onSave) this.onSave(id);
    }
  }

  showStories(stories) {
    this.stories = stories;
    this.render(this.container);
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
    this.container.removeEventListener("click", this._handleClick);
    this.container.innerHTML = "";
  }
}
