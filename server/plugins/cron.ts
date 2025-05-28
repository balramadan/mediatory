import { CronJob } from "cron";

export default defineNitroPlugin((nitroApp) => {
  const isDev = process.env.NODE_ENV !== "production";
  console.log("[Cron] Setting up scheduled tasks...");

  const overdue_endpoint = "/api/transaction/overdue";

  // Jalankan setiap tengah malam
  // Format: Seconds(0-59) Minutes(0-59) Hours(0-23) DayOfMonth(1-31) Months(0-11) DayOfWeek(0-6)
  const dailyJob = new CronJob(
    "0 0 * * *", // Cron syntax sama dengan node-cron
    async function() {
      console.log("[Cron] Running daily check for overdue transactions");
      try {
        await nitroApp.localCall({
          url: overdue_endpoint,
          method: "GET",
        });
        console.log("[Cron] Daily check completed");
      } catch (error) {
        console.error("[Cron] Error executing scheduled task:", error);
      }
    },
    null, // onComplete
    true, // start
    'UTC' // timezone
  );

  // Development job
  let devJob: any;
  if (isDev) {
    devJob = new CronJob(
      "*/10 * * * *", // Setiap 10 menit
      async function() {
        console.log("[Cron Dev] Running check for overdue transactions");
        try {
          await nitroApp.localCall({
            url: overdue_endpoint,
            method: "GET",
          });
          console.log("[Cron Dev] Check completed");
        } catch (error) {
          console.error("[Cron Dev] Error executing scheduled task:", error);
        }
      },
      null, // onComplete
      true, // start
      'UTC' // timezone
    );
  }

  // Pastikan job berhenti saat aplikasi di-shutdown
  nitroApp.hooks.hookOnce('close', () => {
    console.log("[Cron] Stopping scheduled tasks...");
    dailyJob.stop();
    if (devJob) devJob.stop();
  });

  console.log("[Cron] Scheduled tasks set up successfully");
});