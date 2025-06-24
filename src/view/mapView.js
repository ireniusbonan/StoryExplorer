import L from "leaflet";

export default class MapView {
  constructor({ onMapClick }) {
    this.onMapClick = onMapClick;
    this.map = null;
    this.marker = null;
  }

  // render() menerima containerId di submisi sebelumnya.
  // Untuk konsistensi dengan View lain yang menerima elemen container,
  // saya sarankan untuk mengubahnya menjadi menerima elemen langsung,
  // atau pastikan di presenter Anda selalu mengirimkan ID yang benar.
  // Untuk saat ini, kita tetap dengan containerId.
  render(containerId) {
    // Pastikan peta sebelumnya dihancurkan jika ada
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.marker = null;
    }

    this.map = L.map(containerId).setView([-2.5489, 118.0149], 5); // Indonesia center
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(this.map);

    this.map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      if (this.marker) this.map.removeLayer(this.marker);
      this.marker = L.marker([lat, lng]).addTo(this.map);
      this.marker.bindPopup("Lokasi dipilih").openPopup();
      this.onMapClick(lat, lng); // Memicu callback ke Presenter
    });

    // Penting: Invalidate size setelah DOM dirender untuk memastikan peta ditampilkan dengan benar
    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  // Menambahkan metode destroy untuk membersihkan instance peta Leaflet
  destroy() {
    if (this.map) {
      this.map.remove(); // Hancurkan instance peta Leaflet
      this.map = null;
      this.marker = null;
    }
    // Tidak ada DOM yang dihapus di sini karena mapView kemungkinan besar
    // dirender di dalam view lain (storyFormView).
    // Cleanup DOM dilakukan oleh parent view.
  }
}
