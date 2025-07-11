<template>
  <div>
    <Panel header="Syarat & Ketentuan Peminjaman" toggleable collapsed>
      <Divider />
      <ol class="list-decimal list-inside">
        <li>Persyaratan Peminjam</li>
        <ul class="list-disc list-inside ml-5">
          <li>
            Hanya karyawan aktif dengan akun terdaftar di sistem yang
            diperbolehkan meminjam.
          </li>
          <li>
            Peminjam wajib menunjukkan Kartu Identitas Perusahaan saat mengambil
            alat.
          </li>
          <li>
            Peminjam bertanggung jawab penuh atas alat yang dipinjam hingga
            dikembalikan.
          </li>
        </ul>
        <li class="mt-1">Persyaratan Peminjam</li>
        <ul class="list-disc list-inside ml-5">
          <li>
            Persetujuan peminjaman bergantung pada ketersediaan alat dan
            prioritas proyek.
          </li>
          <li>
            Alat hanya boleh digunakan untuk kepentingan operasional perusahaan.
          </li>
        </ul>
        <li class="mt-1">Masa Peminjaman</li>
        <ul class="list-disc list-inside ml-5">
          <li>Maksimal peminjaman: 7 hari kalender.</li>
          <li>
            Perpanjangan waktu hanya diizinkan jika tidak ada peminjaman lain
            yang mengantri (First-Come-First-Served).
          </li>
          <li>
            Pengembalian lewat dari batas waktu dikenakan denda Rp10.000/hari
            per alat.
          </li>
        </ul>
        <li class="mt-1">Penanganan Alat</li>
        <ul class="list-disc list-inside ml-5">
          <li>
            Peminjam wajib menjaga alat dari kerusakan, kehilangan, atau
            penggunaan tidak wajar.
          </li>
          <li>
            Dilarang memodifikasi, membongkar, atau menggunakan alat untuk
            keperluan komersial pribadi.
          </li>
          <li>
            Jika alat rusak, wajib dilaporkan segera ke admin dengan menyertakan
            bukti foto/video.
          </li>
        </ul>
        <li class="mt-1">Pengembalian Alat</li>
        <ul class="list-disc list-inside ml-5">
          <li>
            Alat harus dikembalikan dalam kondisi sesuai saat dipinjam (termasuk
            aksesori lengkap).
          </li>
          <li>
            Pengembalian dilakukan di lokasi yang ditentukan dan diverifikasi
            oleh admin.
          </li>
          <li>
            Jika alat hilang, peminjam wajib mengganti 100% nilai alat
            berdasarkan harga depresiasi.
          </li>
        </ul>
        <li class="mt-1">Sanksi Pelanggaran</li>
        <ul class="list-disc list-inside ml-5">
          <li>
            Kerusakan akibat kelalaian: Biaya perbaikan ditanggung peminjam.
          </li>
          <li>
            Pelanggaran berat (misal: kehilangan alat) dapat berakibat sanksi
            disiplin perusahaan.
          </li>
        </ul>
        <li class="mt-1">Hak Perusahaan</li>
        <ul class="list-disc list-inside ml-5">
          <li>
            PT Media Wanita Gemilang berhak membatalkan/menunda peminjaman tanpa
            pemberitahuan sebelumnya jika:
          </li>
          <ul class="list-disc list-inside ml-5">
            <li>Alat diperlukan untuk proyek prioritas.</li>
            <li>Peminjam melanggar syarat dan ketentuan.</li>
          </ul>
          <li>Perusahaan berhak mengubah kebijakan ini sewaktu-waktu.</li>
        </ul>
      </ol>
    </Panel>
  </div>
</template>

<script lang="ts" setup></script>

<style></style>
