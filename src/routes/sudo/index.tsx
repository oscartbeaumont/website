import { action } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import { getRequestEvent } from "solid-js/web";
import { env } from "cloudflare:workers";

/**
 * Sudo route with Basic authentication
 *
 * Usage:
 * 1. Access /sudo in browser - you'll get a 401 with WWW-Authenticate header
 * 2. Use a tool like curl with Basic auth:
 *    curl -u username:password https://yoursite.com/sudo
 * 3. The username must match SUDO_USERNAME and password should hash to SUDO_PASSWORD_HASH
 */

// Basic auth verification function
async function verifyBasicAuth(authHeader: string): Promise<boolean> {
	if (!authHeader.startsWith("Basic ")) {
		return false;
	}

	try {
		// Decode the base64 credentials
		const base64Credentials = authHeader.substring(6); // Remove "Basic " prefix
		const credentials = atob(base64Credentials);
		const [username, password] = credentials.split(":");

		// Check username
		if (username !== env.SUDO_USERNAME) {
			return false;
		}

		// Hash the password and compare
		const encoder = new TextEncoder();
		const data = encoder.encode(password);
		const hashBuffer = await crypto.subtle.digest("SHA-256", data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");

		return hashHex === env.SUDO_PASSWORD_HASH;
	} catch {
		return false;
	}
}

const getLatestConfigAction = action(async (key: string) => {
	"use server";

	const auth = getRequestEvent()?.request.headers.get("Authorization");
	if (!auth || !auth.startsWith("Basic ")) {
		return { error: "Basic authentication required" };
	}

	// Verify Basic authentication
	const isValidAuth = await verifyBasicAuth(auth);
	if (!isValidAuth) {
		return { error: "Invalid username or password" };
	}

	try {
		const config = await env.KV.get(key);
		return { success: true, config: config || undefined };
	} catch (error) {
		console.error("Failed to fetch configuration:", error);
		return { error: "Failed to fetch configuration" };
	}
});

const writeConfigAction = action(async (formData: FormData) => {
	"use server";

	const auth = getRequestEvent()?.request.headers.get("Authorization");
	if (!auth || !auth.startsWith("Basic ")) {
		return { error: "Basic authentication required" };
	}

	// Verify Basic authentication
	const isValidAuth = await verifyBasicAuth(auth);
	if (!isValidAuth) {
		return { error: "Invalid username or password" };
	}

	try {
		const key = formData.get("key") as string;
		const configJson = formData.get("config") as string;
		if (!configJson || !key) {
			return { error: "No configuration or key provided" };
		}

		await env.KV.put(key, configJson);
		return { success: true, message: "Configuration saved to KV" };
	} catch (error) {
		console.error("Failed to save configuration:", error);
		return { error: "Failed to save configuration" };
	}
});

export default function Page() {
	// TODO: Actually check it's correct
	// TODO: Make this not break hydration
	if (getRequestEvent()?.request.headers.get("Authorization") === undefined)
		return <p>Unauthorized!</p>;

	const [hasInvoicerConfig, setHasInvoicerConfig] = createSignal(false);
	const [hasTimeTrackerConfig, setHasTimeTrackerConfig] = createSignal(false);

	// Check for localStorage config on mount
	onMount(() => {
		const invoicerConfig = localStorage.getItem("invoicer");
		setHasInvoicerConfig(!!invoicerConfig);

		const timeTrackerConfig = localStorage.getItem("time-tracker");
		setHasTimeTrackerConfig(!!timeTrackerConfig);
	});

	const handleGetConfig = async (key: string) => {
		try {
			const result = await getLatestConfigAction(key);
			if (result.error) {
				alert(`Error: ${result.error}`);
			} else if (result.success) {
				if (result.config) {
					localStorage.setItem(key, result.config);
					if (key === "invoicer") {
						setHasInvoicerConfig(true);
					} else if (key === "time-tracker") {
						setHasTimeTrackerConfig(true);
					}
					alert(
						`${key} configuration loaded from KV and saved to localStorage`,
					);
				} else {
					alert(`No ${key} configuration found in KV`);
				}
			}
		} catch (error) {
			console.error("Failed to get configuration:", error);
			alert("Failed to get configuration");
		}
	};

	const handleWriteConfig = async (key: string) => {
		const config = localStorage.getItem(key);
		if (!config) {
			alert(`No ${key} configuration found in localStorage`);
			return;
		}

		const formData = new FormData();
		formData.append("key", key);
		formData.append("config", config);

		try {
			const result = await writeConfigAction(formData);
			if (result.error) {
				alert(`Error: ${result.error}`);
			} else if (result.success) {
				alert(result.message || "Configuration saved successfully");
			}
		} catch (error) {
			console.error("Failed to save configuration:", error);
			alert("Failed to save configuration");
		}
	};

	return (
		<div class="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
			<div class="max-w-2xl mx-auto px-6 py-12">
				<div class="space-y-8">
					<h1 class="text-4xl font-bold mb-2">Sudo</h1>

					{/* Invoicer Section */}
					<div class="space-y-4">
						<a
							href="/invoicer"
							class="text-2xl font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block"
						>
							Invoicer →
						</a>

						<div class="flex space-x-4">
							<button
								type="button"
								onClick={() => handleGetConfig("invoicer")}
								class="bg-white dark:bg-gray-800 text-black dark:text-white font-bold uppercase rounded-md py-2 px-4 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
							>
								Load Config from KV
							</button>

							<button
								type="button"
								onClick={() => handleWriteConfig("invoicer")}
								disabled={!hasInvoicerConfig()}
								class={`font-bold uppercase rounded-md py-2 px-4 transition-colors duration-200 ${
									hasInvoicerConfig()
										? "bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
										: "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-60"
								}`}
							>
								Save Config to KV
							</button>
						</div>
					</div>

					{/* Time Tracker Section */}
					<div class="space-y-4">
						<a
							href="/sudo/time"
							class="text-2xl font-bold hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block"
						>
							Time Tracker →
						</a>

						<div class="flex space-x-4">
							<button
								type="button"
								onClick={() => handleGetConfig("time-tracker")}
								class="bg-white dark:bg-gray-800 text-black dark:text-white font-bold uppercase rounded-md py-2 px-4 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
							>
								Load Data from KV
							</button>

							<button
								type="button"
								onClick={() => handleWriteConfig("time-tracker")}
								disabled={!hasTimeTrackerConfig()}
								class={`font-bold uppercase rounded-md py-2 px-4 transition-colors duration-200 ${
									hasTimeTrackerConfig()
										? "bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
										: "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-60"
								}`}
							>
								Save Data to KV
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
