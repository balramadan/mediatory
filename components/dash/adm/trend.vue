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
            <p class="text-sm font-bold text-blue-600">{{ totalTransactions }}</p>
          </div>
          <div class="bg-green-50 p-2.5 rounded-lg">
            <p class="text-xs text-gray-600">Rata-rata/Bulan</p>
            <p class="text-sm font-bold text-green-600">{{ averagePerMonth }}</p>
          </div>
          <div class="bg-purple-50 p-2.5 rounded-lg">
            <p class="text-xs text-gray-600">Tertinggi</p>
            <p class="text-sm font-bold text-purple-600">{{ highestMonth.month }} ({{ highestMonth.value }})</p>
          </div>
        </div>
      </div>
      <Chart type="line" :data="chartData" :options="chartOptions" class="h-40" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const transactionStatsStore = useTransactionStatsStore();

const chartData = ref();
const chartOptions = ref();
const loading = computed(() => transactionStatsStore.loading);
const error = computed(() => transactionStatsStore.error);
const currentYear = computed(() => transactionStatsStore.monthlyStats.year);
const totalTransactions = computed(() => transactionStatsStore.monthlyStats.total);
const averagePerMonth = computed(() => transactionStatsStore.averagePerMonth);
const highestMonth = computed(() => transactionStatsStore.highestMonth);

const monthNames = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const setChartData = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const monthlyData = transactionStatsStore.monthlyStats.monthly;

  return {
    labels: monthNames,
    datasets: [
      {
        label: "Jumlah Peminjaman",
        data: monthlyData,
        fill: false,
        borderColor: documentStyle.getPropertyValue('--p-fuchsia-500'),
        backgroundColor: documentStyle.getPropertyValue('--p-fuchsia-100'),
        tension: 0.4,
        pointBackgroundColor: documentStyle.getPropertyValue('--p-fuchsia-500'),
        pointBorderColor: documentStyle.getPropertyValue('--p-fuchsia-700'),
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };
};

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue("--p-text-color");
  const textColorSecondary = documentStyle.getPropertyValue("--p-text-muted-color");
  const surfaceBorder = documentStyle.getPropertyValue("--p-content-border-color");

  return {
    maintainAspectRatio: false,
    aspectRatio: 0.6,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: {
            size: 12
          }
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: function(context: any) {
            return `Bulan ${context[0].label}`;
          },
          label: function(context: any) {
            return `${context.dataset.label}: ${context.parsed.y} peminjaman`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Bulan',
          color: textColor
        },
        ticks: {
          color: textColorSecondary,
          maxRotation: 45,
          minRotation: 0
        },
        grid: {
          color: surfaceBorder,
          display: true
        },
      },
      y: {
        title: {
          display: true,
          text: 'Jumlah Peminjaman',
          color: textColor
        },
        ticks: {
          color: textColorSecondary,
          stepSize: 1,
          beginAtZero: true
        },
        grid: {
          color: surfaceBorder,
          display: true
        },
      },
    },
    elements: {
      line: {
        tension: 0.4
      }
    }
  };
};

// Watch untuk update chart ketika data berubah
watch(
  () => transactionStatsStore.monthlyStats,
  () => {
    chartData.value = setChartData();
  },
  { deep: true }
);

onMounted(async () => {
  await transactionStatsStore.fetchMonthlyStats();
  chartData.value = setChartData();
  chartOptions.value = setChartOptions();
});
</script>

<style scoped>
</style>