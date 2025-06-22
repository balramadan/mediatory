<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
    <div class="lg:col-span-8 flex flex-col gap-5">
      <div class="bg-white rounded shadow-sm py-5 px-5">
        <h2 class="font-bold text-lg">Detail Peminjaman</h2>
        <Divider />
        <div class="flex flex-col gap-1">
          <div class="">
            <label for="project">Proyek:</label>
            <InputText id="project" v-model="project" disabled class="w-full" />
          </div>
          <div class="">
            <label for="purpose">Tujuan:</label>
            <Textarea id="purpose" v-model="purpose" disabled class="w-full" />
          </div>
          <div class="flex flex-row items-center gap-5">
            <div class="flex flex-col gap-2 w-full">
              <h3>Tanggal Pinjam:</h3>
              <DatePicker
                v-model="borrowDate"
                disabled
                dateFormat="dd/mm/yy"
                class="w-full"
              />
            </div>
            <div class="flex flex-col gap-2 w-full">
              <h3>Tanggal Kembali:</h3>
              <DatePicker
                v-model="returnDate"
                disabled
                dateFormat="dd/mm/yy"
                class="w-full"
              />
            </div>
          </div>
          <div class="mt-2.5">
            <h3>Peralatan yang dipinjam:</h3>
            <div class="flex flex-col gap-2 mt-5">
              <div
                v-for="(equipment, index) in equipments"
                :key="index"
                class="flex flex-row items-center justify-between bg-gray-50 p-3 rounded"
              >
                <div class="flex flex-row gap-2.5 items-center">
                  <Image v-if="equipment.equipment.imgUrl" preview>
                    <template #image>
                      <NuxtImg
                        :src="equipment.equipment.imgUrl"
                        :alt="equipment.equipment.name"
                        class="w-16 h-16 object-cover rounded"
                      />
                    </template>
                    <template #preview="{ style, previewCallback }">
                      <NuxtImg
                        :src="equipment.equipment.imgUrl"
                        :alt="equipment.equipment.name"
                        :style="style"
                        @click="previewCallback"
                      />
                    </template>
                  </Image>
                  <span v-else class="text-gray-400">No image</span>
                  <div class="">
                    <p class="font-semibold">{{ equipment.equipment.name }}</p>
                    <p class="text-sm">
                      {{ equipment.equipment.category.category_name }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded shadow-sm py-2.5 px-5">
        <h2 class="font-semibold">Log Status</h2>
        <Divider />
        <div class="">
          <Timeline :value="log" align="alternate" class="">
            <template #marker="slotProps">
              <span
                :class="[
                  slotProps.item.icon,
                  slotProps.item.status === 'approved' ||
                  slotProps.item.status === 'returned_complete' ||
                  slotProps.item.status === 'completed'
                    ? 'text-green-500'
                    : slotProps.item.status === 'rejected' ||
                      slotProps.item.status === 'overdue' ||
                      slotProps.item.status === 'returned_damaged' ||
                      slotProps.item.status === 'returned_incomplete'
                    ? 'text-red-500'
                    : 'text-blue-500',
                  'text-xl',
                ]"
              ></span>
            </template>
            <template #opposite="slotProps">
              <p class="text-xs text-gray-400 mt-1">
                {{ new Date(slotProps.item.date).toLocaleString("id-ID") }}
              </p>
            </template>
            <template #content="slotProps">
              <div class="flex flex-col">
                <h3 class="text-sm font-medium mb-1">
                  {{ slotProps.item.title }}
                </h3>
                <p class="text-xs text-gray-500">
                  {{ slotProps.item.description }}
                </p>
              </div>
            </template>
          </Timeline>
        </div>
      </div>
    </div>

    <div class="lg:col-span-4 flex flex-col gap-5">
      <div id="detailUser" class="bg-white rounded shadow-sm py-2.5 px-2.5">
        <h2 class="font-semibold">Detail User</h2>
        <Divider />
        <h3 class="font-bold text-fuchsia-500">
          {{ transaction?.user.full_name }}
        </h3>
        <div class="flex flex-row items-center gap-1">
          <div class="i-material-symbols:mail text-slate-400"></div>
          <p class="text-slate-400 text-sm">{{ transaction?.user.email }}</p>
        </div>
        <div class="flex flex-row items-center gap-1">
          <div class="i-material-symbols:phone-enabled text-slate-400"></div>
          <p class="text-slate-400 text-sm">{{ transaction?.user.phone }}</p>
        </div>

        <!-- Tombol Kontak User jika ada barang rusak/hilang -->
        <div
          v-if="hasProblematicReturns"
          class="mt-3 pt-2 border-t border-gray-200"
        >
          <Button
            icon="i-material-symbols:call"
            label="Hubungi User"
            severity="info"
            size="small"
            class="w-full"
            @click="contactUser"
          />
        </div>
      </div>

      <!-- Card Keputusan -->
      <div v-if="transaction?.admin_id">
        <div class="bg-white rounded shadow-sm py-2.5 px-2.5">
          <h2 class="font-semibold">Peminjaman Diverifikasi</h2>
          <Divider />
          <h3 class="font-bold text-blue-500">
            {{ transaction?.admin?.full_name || "Admin tidak ditemukan" }}
          </h3>
          <div class="flex flex-row items-center gap-1">
            <div class="i-material-symbols:mail text-slate-400"></div>
            <p class="text-slate-400 text-sm">
              {{ transaction?.admin?.email || "" }}
            </p>
          </div>
        </div>

        <div
          v-if="transaction?.return_admin_id"
          class="bg-white rounded shadow-sm py-2.5 px-2.5"
        >
          <h2 class="font-semibold">Admin Verifikasi Pengembalian</h2>
          <Divider />
          <h3 class="font-bold text-green-500">
            {{
              transaction?.return_admin?.full_name || "Admin tidak ditemukan"
            }}
          </h3>
          <div class="flex flex-row items-center gap-1">
            <div class="i-material-symbols:mail text-slate-400"></div>
            <p class="text-slate-400 text-sm">
              {{ transaction?.return_admin?.email || "" }}
            </p>
          </div>
          <div class="flex flex-row items-center gap-1">
            <div class="i-material-symbols:phone-enabled text-slate-400"></div>
            <p class="text-slate-400 text-sm">
              {{ transaction?.return_admin?.phone || "" }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="transaction?.status === 'pending'"
        class="bg-white rounded shadow-sm py-2.5 px-2.5"
      >
        <h2 class="font-semibold">Keputusan</h2>
        <Divider />
        <div class="flex flex-row gap-5 justify-center items-center">
          <Button
            icon="i-material-symbols:check"
            label="Setujui"
            @click.prevent="approved"
          />
          <Button
            icon="i-material-symbols:close"
            label="Tolak"
            severity="secondary"
            @click.prevent="rejected"
          />
        </div>
        <div class="w-full mt-2.5">
          <p class="text-center">Catatan:</p>
          <Textarea
            v-model="notes"
            class="w-full"
            placeholder="Tambahkan catatan jika disetujui atau ditolak"
          />
        </div>
      </div>

      <div
        v-if="transaction?.return_status === 'pending_check'"
        class="bg-white rounded shadow-sm py-2.5 px-2.5"
      >
        <h2 class="font-semibold">Keputusan</h2>
        <Divider />
        <div class="flex flex-row gap-5 justify-center items-center">
          <Button
            icon="i-material-symbols:data-check"
            label="Pengecekan"
            @click.prevent="checkDialog = true"
          />
        </div>
      </div>

      <!-- Card untuk Pengecekan Ulang dan Maintenance -->
      <div
        v-if="
          transaction?.return_status === 'returned_damaged' ||
          transaction?.return_status === 'returned_incomplete'
        "
        class="bg-white rounded shadow-sm py-2.5 px-2.5"
      >
        <h2 class="font-semibold">Keputusan Lanjutan</h2>
        <Divider />

        <div class="flex flex-col gap-3">
          <!-- Info status -->
          <div class="flex flex-row gap-1 justify-center items-center">
            <div class="i-material-symbols:info text-orange-500" />
            <p class="text-sm text-center">
              {{
                transaction?.return_status === "returned_damaged"
                  ? "Terdapat barang rusak yang perlu ditindaklanjuti"
                  : "Terdapat barang hilang yang perlu ditindaklanjuti"
              }}
            </p>
          </div>

          <!-- Tombol aksi -->
          <div class="flex flex-col gap-2">
            <Button
              icon="i-material-symbols:edit-document"
              label="Edit Detail Pengembalian"
              severity="warning"
              size="small"
              @click.prevent="editReturnDialog = true"
            />

            <Button
              v-if="transaction?.return_status === 'returned_damaged'"
              icon="i-material-symbols:build"
              label="Buat Jadwal Maintenance"
              severity="info"
              size="small"
              @click.prevent="maintenanceDialog = true"
            />

            <Button
              v-if="transaction?.return_status === 'returned_incomplete'"
              icon="i-material-symbols:payments"
              label="Atur Denda Penggantian"
              severity="danger"
              size="small"
              @click.prevent="penaltyDialog = true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="checkDialog"
    header="Pengecekan Alat"
    modal
    maximizable
    :style="{ width: '50rem' }"
  >
    <FormCheckreturn
      :transactionId="parseInt(id)"
      @cancel="checkDialog = false"
      @completed="
        {
          checkDialog = false;
          refreshTransaction();
          log = constructTransactionLog(transaction?.value);
        }
      "
    />
  </Dialog>

  <!-- Dialog untuk Edit Return Detail -->
  <Dialog
    v-model:visible="editReturnDialog"
    header="Edit Detail Pengembalian"
    modal
    maximizable
    :style="{ width: '60rem' }"
  >
    <FormEditReturnDetail
      :transactionId="parseInt(id)"
      :returnDetails="transaction?.equipment_returns || []"
      @cancel="editReturnDialog = false"
      @completed="handleEditReturnCompleted"
    />
  </Dialog>

  <!-- Dialog untuk Maintenance -->
  <Dialog
    v-model:visible="maintenanceDialog"
    header="Buat Jadwal Maintenance"
    modal
    :style="{ width: '50rem' }"
  >
    <FormMaintenanceFromReturn
      :transactionId="parseInt(id)"
      :damagedItems="damagedItems"
      :borrowerInfo="transaction?.user"
      @cancel="maintenanceDialog = false"
      @completed="handleMaintenanceCompleted"
    />
  </Dialog>

  <!-- Dialog untuk Penalty -->
  <Dialog
    v-model:visible="penaltyDialog"
    header="Atur Denda Penggantian"
    modal
    :style="{ width: '50rem' }"
  >
    <FormPenaltyManagement
      :transactionId="parseInt(id)"
      :lostItems="lostItems"
      :borrowerInfo="transaction?.user"
      @cancel="penaltyDialog = false"
      @completed="handlePenaltyCompleted"
    />
  </Dialog>
</template>

<script lang="ts" setup>
const trStore = useTransactionStore();
const admStore = useAdminStore();

const toast = useToast();
const route = useRoute();
const id = route.params.id as string;

const checkDialog = ref(false);
const transaction = ref();
const equipments = ref();
const project = ref();
const purpose = ref();
const borrowDate = ref();
const returnDate = ref();
const log = ref();
const notes = ref("");
const editReturnDialog = ref(false);
const maintenanceDialog = ref(false);
const penaltyDialog = ref(false);

// Refresh transaksi
const refreshTransaction = async () => {
  await trStore.getAllTransaction();
  transaction.value = trStore.getTransaction(parseInt(id));
};

onMounted(async () => {
  await refreshTransaction();

  equipments.value = transaction.value?.equipments;
  project.value = transaction.value?.project;
  purpose.value = transaction.value?.purpose;
  borrowDate.value = transaction.value?.borrow_date;
  returnDate.value = transaction.value?.return_date;

  log.value = constructTransactionLog(transaction?.value);
});

const approved = async () => {
  const adminId = admStore.admin.id;

  await trStore
    .approveTransaction(parseInt(id), adminId, notes.value)
    .then(async () => {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "Peminjaman berhasil disetujui",
        life: 3000,
      });

      await refreshTransaction();
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: `Gagal menyetujui peminjaman: ${err}`,
        life: 3000,
      });
    });
};

const rejected = async () => {
  const adminId = admStore.admin.id;

  await trStore
    .rejectTransaction(parseInt(id), adminId, notes.value)
    .then(async () => {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "Peminjaman telah ditolak",
        life: 3000,
      });

      await refreshTransaction();
      log.value = constructTransactionLog(transaction?.value);
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: `Gagal menyetujui peminjaman: ${err}`,
        life: 3000,
      });
    });
};

// Computed properties untuk mengecek kondisi barang
const hasProblematicReturns = computed(() => {
  if (!transaction.value?.equipment_returns) return false;
  return transaction.value.equipment_returns.some(
    (item: any) =>
      item.condition === "damaged" ||
      item.condition === "lost" ||
      item.condition === "incomplete"
  );
});

const damagedItems = computed(() => {
  if (!transaction.value?.equipment_returns) return [];
  return transaction.value.equipment_returns.filter(
    (item: any) => item.condition === "damaged"
  );
});

const lostItems = computed(() => {
  if (!transaction.value?.equipment_returns) return [];
  return transaction.value.equipment_returns.filter(
    (item: any) => item.condition === "lost" || item.condition === "incomplete"
  );
});

// Methods
const contactUser = () => {
  const user = transaction.value?.user;
  if (!user) return;

  // Buat pesan template
  const problematicItems = transaction.value.equipment_returns
    .filter((item: any) => item.condition !== "good")
    .map(
      (item: any) =>
        `${item.equipment.name} (${
          item.condition === "damaged" ? "Rusak" : "Hilang/Tidak Lengkap"
        })`
    )
    .join(", ");

  const message = `Halo ${user.full_name}, terkait pengembalian alat untuk transaksi #${transaction.value.transaction_id}, ditemukan beberapa item bermasalah: ${problematicItems}. Mohon segera hubungi admin untuk penjelasan lebih lanjut.`;

  // Buka WhatsApp atau aplikasi pesan
  const phoneNumber = user.phone.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${
    phoneNumber.startsWith("62") ? phoneNumber : "62" + phoneNumber.substring(1)
  }?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank");
};

const handleEditReturnCompleted = async (data: any) => {
  editReturnDialog.value = false;
  await refreshTransaction();
  log.value = constructTransactionLog(transaction?.value);

  toast.add({
    severity: "success",
    summary: "Berhasil",
    detail: "Detail pengembalian berhasil diperbarui",
    life: 3000,
  });
};

const handleMaintenanceCompleted = async (data: any) => {
  maintenanceDialog.value = false;
  await refreshTransaction();
};

const handlePenaltyCompleted = async (data: any) => {
  penaltyDialog.value = false;
  await refreshTransaction();

  toast.add({
    severity: "success",
    summary: "Berhasil",
    detail: "Denda penggantian berhasil diatur",
    life: 3000,
  });
};

const formatDate = (dateString: any) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const constructTransactionLog = (tr: any) => {
  if (!transaction) return [];

  const logs: any[] = [];

  logs.push({
    date: new Date(tr.createdAt),
    status: "created",
    title: "Peminjaman Dibuat",
    description: `Peminjaman dibuat oleh ${tr.user.full_name}`,
    icon: "i-material-symbols:edit-document",
  });

  if (tr.verified_at) {
    logs.push({
      date: new Date(tr.verified_at),
      status: tr.status,
      title:
        tr.status === "approved"
          ? "Peminjaman Disetujui"
          : tr.status === "rejected"
          ? "Peminjaman Ditolak"
          : "Status Diperbarui",
      description:
        tr.verified_notes ||
        (tr.status === "approved"
          ? "Peminjaman disetujui oleh admin"
          : tr.status === "rejected"
          ? "Peminjaman ditolak oleh admin"
          : "Status peminjaman diperbarui"),
      icon:
        tr.status === "approved"
          ? "i-material-symbols:check-circle"
          : tr.status === "rejected"
          ? "i-material-symbols:cancel"
          : "i-material-symbols:update",
    });
  }

  if (tr.return_status !== "not_returned") {
    logs.push({
      date: tr.return_verified_at
        ? new Date(tr.return_verified_at)
        : new Date(),
      status: tr.return_status,
      title:
        tr.return_status === "pending_check"
          ? "Menunggu Pengecekan Pengembalian"
          : tr.return_status === "returned_complete"
          ? "Pengembalian Lengkap"
          : tr.return_status === "returned_damaged"
          ? "Pengembalian dengan Kerusakan"
          : tr.return_status === "returned_incomplete"
          ? "Pengembalian Tidak Lengkap / Hilang"
          : "Status Pengembalian Diperbarui",
      description: tr.return_verified_notes || "Status pengembalian diperbarui",
      icon:
        tr.return_status === "pending_check"
          ? "i-material-symbols:pending-actions"
          : tr.return_status === "returned_complete"
          ? "i-material-symbols:assignment-turned-in"
          : tr.return_status === "returned_damaged"
          ? "i-material-symbols:hardware-broken"
          : tr.return_status === "returned_incomplete"
          ? "i-material-symbols:incomplete-circle"
          : "i-material-symbols:update",
    });
  }

  if (tr.status === "completed") {
    logs.push({
      date: tr.return_verified_at
        ? new Date(tr.return_verified_at)
        : new Date(),
      status: "completed",
      title: "Transaksi Selesai",
      description: "Peminjaman telah selesai",
      icon: "i-material-symbols:task-alt",
    });
  }

  if (tr.status === "overdue") {
    logs.push({
      date: new Date(tr.return_date),
      status: "overdue",
      title: "Pengembalian Terlambat",
      description: "Batas waktu pengembalian telah terlewati",
      icon: "i-material-symbols:assignment-late",
    });
  }

  return logs.sort((a, b) => a.date - b.date);
};

definePageMeta({
  layout: "dashadm",
  middleware: ["auth-admin"],
});

useSeoMeta({
  title: "Detail Transaksi | Mediawi",
  description: "Halaman detail transaksi",
  ogTitle: "Detail Transaksi | Mediawi",
});
</script>

<style scope>
.p-datepicker-today > .p-datepicker-day {
  background: rgb(240, 150, 253);
}
</style>
