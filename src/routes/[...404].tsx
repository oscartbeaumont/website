import { A } from "@solidjs/router";
import { HttpStatusCode } from "@solidjs/start";
import { Layout } from ".";

export default function Page() {
  return (
    <Layout>
      <HttpStatusCode code={404} />

      <main class="flex flex-col items-center justify-center min-h-[70vh]">
        <div class="text-center space-y-6">
          <h1 class="text-8xl md:text-9xl font-bold text-gray-900 tracking-tight">
            404
          </h1>
          <div class="space-y-3">
            <h2 class="text-2xl md:text-3xl font-semibold text-gray-700">
              Page Not Found
            </h2>
            <p class="text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div class="pt-6">
            <A
              href="/"
              class="inline-flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-200 font-medium border border-gray-300 rounded-lg hover:border-gray-900"
            >
              <span>← Back to Home</span>
            </A>
          </div>
        </div>
      </main>
    </Layout>
  );
}
