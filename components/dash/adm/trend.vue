<template>
  <div>
    <div v-if="loading" class="flex justify-center items-center">
      <ProgressSpinner />
    </div>
    <div v-else-if="error" class="text-red-500 text-center p-4">
      {{ error }}
    </div>
    <div v-else>
      <div class="mb-4">
        <h3 class="text-sm font-semibold mb-2">{{ currentYear }}</h3>
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div class="bg-blue-50 p-2.5 rounded-lg">
            <p class="text-xs text-gray-600">Total Peminjaman</p>
            <p class="text-sm font-bold text-blue-600">
              {{ totalTransactions }}
            </p>
          </div>
          <div class="bg-green-50 p-2.5 rounded-lg">
            <p class="text-xs text-gray-600">Rata-rata/Bulan</p>
            <p class="text-sm font-bold text-green-600">
              {{ averagePerMonth }}
            </p>
          </div>
          <div class="bg-purple-50 p-2.5 rounded-lg">
            <p class="text-xs text-gray-600">Tertinggi</p>
            <p class="text-sm font-bold text-purple-600">
              {{ highestMonth.month }} ({{ highestMonth.value }})
            </p>
          </div>
        </div>
      </div>
      <!-- Pastikan chart hanya render ketika data sudah ada -->
      <div v-if="isChartReady">
        <Chart
          id="chartData"
          type="line"
          :data="chartData"
          :options="chartOptions"
          class="h-40"
          :key="chartKey"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const transactionStatsStore = useTransactionStatsStore();

const chartData = ref();
const chartOptions = ref();
const chartKey = ref(0); // Key untuk force re-render chart

const loading = computed(() => transactionStatsStore.loading);
const error = computed(() => transactionStatsStore.error);
const currentYear = computed(() => transactionStatsStore.monthlyStats.year);
const totalTransactions = computed(
  () => transactionStatsStore.monthlyStats.total
);
const averagePerMonth = computed(() => transactionStatsStore.averagePerMonth);
const highestMonth = computed(() => transactionStatsStore.highestMonth);

// Computed untuk memastikan chart siap di-render
const isChartReady = computed(() => {
  return (
    !loading.value &&
    !error.value &&
    chartData.value !== null &&
    chartOptions.value !== null &&
    transactionStatsStore.monthlyStats.monthly.length > 0
  );
});

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const setChartData = () => {
  // Pastikan DOM sudah ready dan data tersedia
  if (
    typeof document === "undefined" ||
    !transactionStatsStore.monthlyStats.monthly
  ) {
    return null;
  }

  const documentStyle = getComputedStyle(document.documentElement);
  const monthlyData = transactionStatsStore.monthlyStats.monthly;

  return {
    labels: monthNames,
    datasets: [
      {
        label: "Jumlah Peminjaman",
        data: monthlyData,
        fill: false,
        borderColor:
          documentStyle.getPropertyValue("--p-fuchsia-500") || "#d946ef",
        backgroundColor:
          documentStyle.getPropertyValue("--p-fuchsia-100") || "#fae8ff",
        tension: 0.4,
        pointBackgroundColor:
          documentStyle.getPropertyValue("--p-fuchsia-500") || "#d946ef",
        pointBorderColor:
          documentStyle.getPropertyValue("--p-fuchsia-700") || "#a21caf",
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };
};

const setChartOptions = () => {
  // Pastikan DOM sudah ready
  if (typeof document === "undefined") {
    return null;
  }

  const documentStyle = getComputedStyle(document.documentElement);
  const textColor =
    documentStyle.getPropertyValue("--p-text-color") || "#374151";
  const textColorSecondary =
    documentStyle.getPropertyValue("--p-text-muted-color") || "#6b7280";
  const surfaceBorder =
    documentStyle.getPropertyValue("--p-content-border-color") || "#e5e7eb";

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          title: function (context: any) {
            return `Bulan ${context[0].label}`;
          },
          label: function (context: any) {
            return `${context.dataset.label}: ${context.parsed.y} peminjaman`;
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Bulan",
          color: textColor,
        },
        ticks: {
          color: textColorSecondary,
          maxRotation: 45,
          minRotation: 0,
        },
        grid: {
          color: surfaceBorder,
          display: true,
        },
      },
      y: {
        title: {
          display: true,
          text: "Jumlah Peminjaman",
          color: textColor,
        },
        ticks: {
          color: textColorSecondary,
          stepSize: 1,
          beginAtZero: true,
        },
        grid: {
          color: surfaceBorder,
          display: true,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };
};

// Function untuk update chart data
const updateChart = () => {
  nextTick(() => {
    const newData = setChartData();
    const newOptions = setChartOptions();

    if (newData && newOptions) {
      chartData.value = newData;
      chartOptions.value = newOptions;
      chartKey.value++; // Force re-render
    }
  });
};

// Watch untuk update chart ketika data berubah
watch(
  () => transactionStatsStore.monthlyStats,
  (newStats) => {
    if (newStats && newStats.monthly && newStats.monthly.length > 0) {
      updateChart();
    }
  },
  { deep: true, immediate: false }
);

// Watch untuk loading state
watch(
  () => transactionStatsStore.loading,
  (isLoading) => {
    if (!isLoading && transactionStatsStore.monthlyStats.monthly.length > 0) {
      updateChart();
    }
  }
);

onMounted(async () => {
  try {
    // Pastikan DOM sudah siap
    await nextTick();

    // Fetch data
    await transactionStatsStore.fetchMonthlyStats();

    // Update chart setelah data tersedia
    if (!transactionStatsStore.loading && !transactionStatsStore.error) {
      updateChart();
    }
  } catch (error) {
    console.error("Error initializing chart:", error);
  }
});

// Cleanup saat component di-unmount
onUnmounted(() => {
  chartData.value = null;
  chartOptions.value = null;
});
</script>

<style scoped></style>
