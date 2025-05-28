<template>
  <div class="grid grid-cols-12 gap-5">
    <div class="col-span-8 flex flex-col gap-5">
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
                v-for="(item, index) in equipments"
                class="flex flex-row items-center justify-between py-2.5 px-2.5 rounded border-0.2 border-slate-400"
                :key="index"
              >
                <div class="">
                  <p class="font-semibold">{{ item.equipment.name }}</p>
                  <p class="text-sm">
                    {{ item.equipment.category.category_name }}
                  </p>
                </div>
                <p>Jumlah: {{ item.quantity }}</p>
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
    <div class="col-span-4 flex flex-col gap-5">
      <div id="detailUser" class="bg-white rounded shadow-sm py-2.5 px-2.5">
        <h2 class="font-semibold">Data Diri</h2>
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
      </div>

      <!-- Card Keputusan -->
      <div
        v-if="transaction?.status === 'pending'"
        class="bg-white rounded shadow-sm py-2.5 px-2.5"
      >
        <h2 class="font-semibold">Keputusan</h2>
        <Divider />
        <div class="flex flex-row gap-5 justify-center items-center">
          <Button
            icon="i-material-symbols:close"
            label="Batalkan"
            severity="secondary"
            @click.prevent="cancelled"
          />
        </div>
      </div>

      <div
        v-if="transaction?.return_status === 'not_returned'"
        class="bg-white rounded shadow-sm py-2.5 px-2.5"
      >
        <h2 class="font-semibold">Keputusan</h2>
        <Divider />
        <div class="flex flex-row gap-5 justify-center items-center">
          <Button
            icon="i-material-symbols:assignment-return"
            label="Proses Pengembalian"
            @click.prevent="returnConfirmDialog = true"
          />
        </div>
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="returnConfirmDialog"
    header="Konfirmasi Pengembalian"
    :modal="true"
    :style="{ width: '25rem' }"
  >
    <div class="flex items-center gap-4">
      <div class="i-material-symbols:warning !text-3xl" />
      <span
        >Pastikan alat diletakkan ditempat semula, agar mempermudah
        pengecekan</span
      >
    </div>
    <template #footer>
      <Button
        label="No"
        icon="i-material-symbols:close"
        severity="danger"
        text
        @click="returnConfirmDialog = false"
      />
      <Button
        label="Yes"
        icon="i-material-symbols:check"
        text
        @click="returned"
      />
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
const trStore = useTransactionStore();

const toast = useToast();
const route = useRoute();
const id = route.params.id as string;

const transaction = ref();
const equipments = ref();
const project = ref();
const purpose = ref();
const borrowDate = ref();
const returnDate = ref();
const log = ref();

const returnConfirmDialog = ref(false);

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

const cancelled = async () => {
  await trStore
    .cancelledTransaction(parseInt(id))
    .then(async () => {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "Peminjaman telah dibatalkan",
        life: 3000,
      });

      navigateTo("/");
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: `Gagal: ${err}`,
        life: 3000,
      });
    });
};

const returned = async () => {
  await trStore
    .returnTransaction(parseInt(id))
    .then(async () => {
      toast.add({
        severity: "success",
        summary: "Berhasil",
        detail: "Pengembalian alat akan di cek admin",
        life: 3000,
      })
      await refreshTransaction();
      log.value = constructTransactionLog(transaction?.value);
      returnConfirmDialog.value = false;
    })
    .catch((err) => {
      toast.add({
        severity: "error",
        summary: "Gagal",
        detail: `Gagal: ${err}`,
        life: 3000,
      });
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
          ? "Pengembalian Tidak Lengkap"
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
      icon: "i-material-symbols:running-late",
    });
  }

  return logs.sort((a, b) => a.date - b.date);
};

definePageMeta({
  layout: "dashuser",
  middleware: ["auth"],
});

useSeoMeta({
  title: "Daftar Peralatan | Mediawi",
  description: "Daftar Peralatan yang bisa dipinjam",
  ogTitle: "Daftar Peralatan | Mediawi",
});
</script>

<style></style>
