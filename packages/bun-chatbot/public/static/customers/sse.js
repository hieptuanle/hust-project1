// public/static/customers/sse.js
document.addEventListener("DOMContentLoaded", () => {
  const eventSource = new EventSource("/customers/sse");
  const eventList = document.getElementById("event-list");

  eventSource.addEventListener("jobsUpdate", (event) => {
    console.log("jobsUpdate", event);
    const jobs = JSON.parse(event.data);
    // Update your UI with the jobs data
    const jobsList = jobs
      .map(
        (job) => `
      <li class="p-3 bg-gray-50 rounded-md">
        <div class="font-medium">Job ${job.id}</div>
        <div class="text-sm text-gray-600">Type: ${job.type}</div>
        <div class="text-sm text-gray-600">Status: ${job.status}</div>
      </li>
    `,
      )
      .join("");

    eventList.innerHTML = `
      <ul class="space-y-2 list-none">
        ${jobsList}
      </ul>
    `;
  });

  eventSource.addEventListener("error", () => {
    console.error("SSE connection error");
    // Optionally implement reconnection logic here
  });
});
