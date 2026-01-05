import { redirect } from "@solidjs/router";
import { action } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";
import { getRequestEvent } from "solid-js/web";
import { env } from "cloudflare:workers";

// Password verification function
async function verifyPassword(password: string): Promise<boolean> {
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
	return hashHex === env.SUDO_PASSWORD_HASH;
}

const getLatestConfigAction = action(async (formData: FormData) => {
	"use server";

	const auth = getRequestEvent()?.request.headers.get("Authorization");
	if (!auth) throw redirect("/login");

	const password = formData.get("password") as string;
	if (!password) {
		return { error: "Password is required" };
	}

	// Verify password
	const isValidPassword = await verifyPassword(password);
	if (!isValidPassword) {
		return { error: "Invalid password" };
	}

	try {
		const config = await env.KV.get("invoicer");
		return { success: true, config: config || undefined };
	} catch (error) {
		console.error("Failed to fetch configuration:", error);
		return { error: "Failed to fetch configuration" };
	}
});

const writeConfigAction = action(async (formData: FormData) => {
	"use server";

	const auth = getRequestEvent()?.request.headers.get("Authorization");
	if (!auth) throw redirect("/login");

	const password = formData.get("password") as string;
	if (!password) {
		return { error: "Password is required" };
	}

	// Verify password
	const isValidPassword = await verifyPassword(password);
	if (!isValidPassword) {
		return { error: "Invalid password" };
	}

	try {
		const configJson = formData.get("config") as string;
		if (!configJson) {
			return { error: "No configuration found in localStorage" };
		}

		await env.KV.put("invoicer", configJson);
		return { success: true, message: "Configuration saved to KV" };
	} catch (error) {
		console.error("Failed to save configuration:", error);
		return { error: "Failed to save configuration" };
	}
});

export default function Page() {
	const [hasLocalConfig, setHasLocalConfig] = createSignal(false);

	// Check for localStorage config on mount
	onMount(() => {
		const config = localStorage.getItem("invoicer");
		setHasLocalConfig(!!config);
	});

	const handleGetConfig = async () => {
		const password = prompt("Enter password:");
		if (!password) {
			return;
		}

		const formData = new FormData();
		formData.append("password", password);

		try {
			const result = await getLatestConfigAction(formData);
			if (result.error) {
				alert(`Error: ${result.error}`);
			} else if (result.success) {
				if (result.config) {
					localStorage.setItem("invoicer", result.config);
					setHasLocalConfig(true);
					alert("Configuration loaded from KV and saved to localStorage");
				} else {
					alert("No configuration found in KV");
				}
			}
		} catch (error) {
			console.error("Failed to get configuration:", error);
			alert("Failed to get configuration");
		}
	};

	const handleWriteConfig = async () => {
		const config = localStorage.getItem("invoicer");
		if (!config) {
			alert("No configuration found in localStorage");
			return;
		}

		const password = prompt("Enter password:");
		if (!password) {
			return;
		}

		const formData = new FormData();
		formData.append("password", password);
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
				<div class="space-y-6">
					<h1 class="text-4xl font-bold mb-2">Sudo</h1>
					<h3 class="text-2xl font-bold">Invoicer</h3>

					<div class="flex space-x-4">
						<button
							type="button"
							onClick={handleGetConfig}
							class="bg-white dark:bg-gray-800 text-black dark:text-white font-bold uppercase rounded-md py-2 px-4 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
						>
							Load Config from KV
						</button>

						<button
							type="button"
							onClick={handleWriteConfig}
							disabled={!hasLocalConfig()}
							class={`font-bold uppercase rounded-md py-2 px-4 transition-colors duration-200 ${
								hasLocalConfig()
									? "bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
									: "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 cursor-not-allowed opacity-60"
							}`}
						>
							Save Config to KV
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
