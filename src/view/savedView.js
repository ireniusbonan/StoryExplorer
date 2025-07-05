import db from "../model/indexedDbModel.js";

const savedView = {
  async render() {
    const stories = await db.getStories();
    return `
      <section class="saved-stories">
        <h2>Cerita Tersimpan</h2>
        ${
          stories.length === 0
            ? "<p>Belum ada cerita yang disimpan offline.</p>"
            : stories
                .map(
                  (s) => `
              <article>
                <h3>${s.name}</h3>
                <img src="${s.photoUrl}" alt="${s.name}" />
                <p>${s.description}</p>
              </article>
            `
                )
                .join("")
        }
      </section>
    `;
  },
};

export default savedView;
