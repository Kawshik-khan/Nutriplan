const LANDING_APP_URL = "/landing";
const DASHBOARD_APP_URL = "/dashboard";
const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ?? "http://localhost:4000";

async function getBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { ok: false, status: `HTTP ${response.status}` };
    }

    const payload = (await response.json()) as { ok?: boolean; service?: string };
    return {
      ok: payload.ok === true,
      status: payload.service ?? "nutriplan-backend",
    };
  } catch {
    return { ok: false, status: "Backend unreachable" };
  }
}

export default async function Home() {
  const health = await getBackendHealth();

  return (
    <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-lime-100 p-6">
      <main className="w-full max-w-3xl rounded-3xl border border-emerald-200 bg-white/95 p-8 shadow-2xl sm:p-12">
        <div className="mb-10">
          <p className="mb-2 inline-flex rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            Nutriplan Workspace
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-emerald-950 sm:text-5xl">
            Full-Stack Nutriplan is ready
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-700 sm:text-lg">
            Use this root app as a launcher for your landing/auth app, dashboard app,
            and backend API.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <a
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-emerald-700"
            href={LANDING_APP_URL}
          >
            Open Landing and Auth
          </a>
          <a
            className="inline-flex items-center justify-center rounded-2xl border border-emerald-600 px-5 py-3 text-base font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
            href={DASHBOARD_APP_URL}
          >
            Open Dashboard App
          </a>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-medium text-zinc-700">Backend Health</p>
          <p className={`mt-1 text-sm ${health.ok ? "text-emerald-700" : "text-red-600"}`}>
            {health.ok ? "Connected" : "Not Connected"} - {health.status}
          </p>
          <p className="mt-2 text-xs text-zinc-500">Health URL: /api/health (proxied to localhost:4000)</p>
        </div>
      </main>
    </div>
  );
}
