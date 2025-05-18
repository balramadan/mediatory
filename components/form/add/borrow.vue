<template>
  <Form class="flex flex-col gap-5 mt-1 w-full">
    <Stepper value="1" linear>
      <StepItem value="1">
        <Step>Form Pinjam</Step>
        <StepPanel v-slot="{ activateCallback }">
          <div class="flex flex-col gap-5">
            <FloatLabel variant="on">
              <InputText id="name" v-model="name" disabled class="w-full" />
              <label for="name">Nama</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <InputText id="project" v-model="project" class="w-full" />
              <label for="project">Proyek</label>
            </FloatLabel>
            <FloatLabel variant="on">
              <TextArea
                id="purpose"
                v-model="purpose"
                rows="5"
                cols="30"
                class="w-full"
              />
              <label for="purpose">Tujuan Peminjaman</label>
            </FloatLabel>
            <div class="flex flex-row gap-5">
              <FloatLabel class="w-full" variant="on">
                <DatePicker
                  id="date"
                  v-model="borrowDate"
                  class="w-full"
                  dateFormat="dd/mm/yy"
                  :minDate="minDate"
                  :manualInput="false"
                />
                <label for="date">Tanggal Pinjam</label>
              </FloatLabel>
              <FloatLabel class="w-full" variant="on">
                <Select
                  v-model="duration"
                  class="w-full"
                  :options="optionDuration"
                  optionLabel="label"
                />
                <label for="date">Durasi Peminjaman</label>
              </FloatLabel>
            </div>
          </div>
          <div class="py-6">
            <Button v-if="isFormValid" severity="contrast" label="Next" @click="activateCallback('2')" />
          </div>
        </StepPanel>
      </StepItem>

      <StepItem value="2">
        <Step>Syarat & Ketentuan</Step>
        <StepPanel v-slot="{ activateCallback }">
          <div class="p-5 border-1 border-solid">
            <Syarat />
            <div class="mt-5 flex flex-row gap-2 items-center">
              <Checkbox v-model="checked" binary />
              <p>Saya telah membaca dan menyetujui syarat & ketentuan</p>
            </div>
          </div>
          <div class="flex py-6 gap-2">
            <Button label="Back" severity="secondary" @click="activateCallback('1')" />
            <Button v-if="checked" type="submit" severity="contrast" label="Pinjam" @click="addBorrow()" />
          </div>
        </StepPanel>
      </StepItem>
    </Stepper>
  </Form>
</template>

<script lang="ts" setup>
const userStore = useUserStore();
const cart = useCartStore();

const name = ref("");
const project = ref("");
const purpose = ref("");
const borrowDate = ref();
const duration = ref();
const checked = ref(false);
const minDate = ref(new Date());

const optionDuration = ref([
  {
    label: "1 Hari",
    value: 1,
  },
  {
    label: "2 Hari",
    value: 2,
  },
  {
    label: "3 Hari",
    value: 3,
  },
  {
    label: "4 Hari",
    value: 4,
  },
  {
    label: "5 Hari",
    value: 5,
  },
  {
    label: "6 Hari",
    value: 6,
  },
  {
    label: "7 Hari",
    value: 7,
  },
]);

const isFormValid = computed(() => {
  return (
    project.value.trim() !== "" &&
    purpose.value.trim() !== "" &&
    borrowDate.value !== undefined &&
    borrowDate.value !== null &&
    duration.value !== undefined &&
    duration.value !== null
  );
});

function formatDate(date: any) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function calculateReturnDate() {
  if (!borrowDate.value || !duration.value) return null;

  const returnDate = new Date(borrowDate.value);
  returnDate.setDate(returnDate.getDate() + duration.value.value);
  return returnDate;
}

const addBorrow = async () => {
  await $fetch('/api/borrow/add', {
    method: "POST",
    body: {
      user_id: userStore.user.id,
      project: project.value,
      purpose: purpose.value,
      borrow_date: formatDate(borrowDate.value),
      return_date: formatDate(calculateReturnDate()),
    },
  })
}

onMounted(async () => {
  name.value = userStore.user.name;
});
</script>

<style></style>
