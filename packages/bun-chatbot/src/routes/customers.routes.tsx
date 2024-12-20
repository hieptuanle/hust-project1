import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import type Storage from "../storage/Storage";
import { cn } from "../libs/utils";
import { formatTimeAgo } from "../libs/datetime";
import type { Cron } from "../cron";
import { randomUUIDv7 } from "bun";

const app = new Hono<{
  Variables: {
    storage: Storage;
    cron: Cron;
  };
}>();

// New PlatformTag component
const PlatformTag = ({ platform }: { platform: string }) => {
  return (
    <span
      class={cn(
        "inline-block px-2 py-1 text-xs rounded-full font-medium",
        platform === "telegram"
          ? "bg-green-100 text-green-800"
          : platform === "meta"
          ? "bg-blue-400 text-white"
          : "bg-blue-100 text-gray-800"
      )}
    >
      {platform}
    </span>
  );
};

app.get("/sse", (c) => {
  const cron = c.var.cron;

  return streamSSE(c, async (stream) => {
    for await (const jobs of cron.subscribeToJobs()) {
      console.log("jobsUpdate sse", jobs);
      await stream.writeSSE({
        data: JSON.stringify(jobs),
        event: "jobsUpdate",
        id: randomUUIDv7(),
      });
    }
  });
});

app.get("/", async (c) => {
  const storage = c.var.storage;
  const customers = await storage.platformUser.getUsers();
  return c.html(
    <html>
      <head>
        <title>Platform Customers</title>
        <link href="/dist/globals.css" rel="stylesheet" />
        <link rel="icon" href="/static/logo.png" />
        <script src="/static/customers/sse.js"></script>
      </head>

      <body class="bg-gray-100 min-h-screen">
        <div class="container mx-auto p-8 max-w-2xl">
          <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">
            Platform Customers
          </h1>

          <div class="bg-white p-6 rounded-lg shadow-md space-y-6">
            {customers.map((customer) => (
              <div class="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                <div class="flex items-center gap-2 mb-2">
                  <h2 class="text-xl font-semibold text-gray-700">
                    {customer.name || "No name"}
                  </h2>
                  <PlatformTag platform={customer.platform} />
                </div>
                <div class="space-y-2 text-gray-600">
                  <p>ID: {customer.id}</p>
                  <p>Phone: {customer.phone || "No phone"}</p>
                  <p class="text-sm text-gray-500">
                    Last interaction:{" "}
                    {formatTimeAgo(customer.lastInteraction.getTime())}
                  </p>
                </div>
              </div>
            ))}

            <div id="event-list">
              <ul class="space-y-2 list-none">
                <li class="text-gray-600">Loading...</li>
              </ul>
            </div>

            <div class="mt-8 pt-6 border-t border-gray-200">
              <a
                href="/"
                class="block p-3 rounded-md hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors text-center"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
});

export default app;
