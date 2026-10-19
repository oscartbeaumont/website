import { Meta, Title } from "@solidjs/meta";
import { defineFileRoute } from "@solidjs/router/fs";
import {
	createMemo,
	createSignal,
	Match,
	onSettled,
	Show,
	Switch,
} from "solid-js";
import "@fontsource-variable/fraunces";
import "@fontsource/lora/400.css";
import "@fontsource/lora/500.css";
import "@fontsource/caveat/400.css";
import "@fontsource/caveat/500.css";
import "./addy.css";
import {
	anniversaryLabel,
	daysTogether,
	groupPlaces,
	sortedNewest,
} from "../../addy/album";
import {
	downloadAlbum,
	fetchPhotos,
	fetchSession,
	logout,
	removePhoto,
	type SessionState,
} from "../../addy/client";
import { Gallery } from "../../addy/components/Gallery";
import { Hero } from "../../addy/components/Hero";
import { Icon } from "../../addy/components/Icons";
import { Lightbox } from "../../addy/components/Lightbox";
import { Places } from "../../addy/components/Places";
import {
	EditSheet,
	LoginSheet,
	UploadSheet,
} from "../../addy/components/Sheets";
import { Timeline } from "../../addy/components/Timeline";
import type { AddyPhoto } from "../../addy/store";
import { createDateNow } from "../../date";

export const route = defineFileRoute("/addy", {});

type View = "gallery" | "timeline" | "places";
type Viewer = { list: AddyPhoto[]; index: number };

function viewFromHash(): View {
	if (typeof window === "undefined") return "gallery";
	const hash = window.location.hash.replace("#", "");
	return hash === "timeline" || hash === "places" ? hash : "gallery";
}

function errorText(error: unknown): string {
	return error instanceof Error ? error.message : "Something went wrong.";
}

export default function Page() {
	const [photos, setPhotos] = createSignal<AddyPhoto[] | null>(null);
	const [session, setSession] = createSignal<SessionState>({
		authenticated: false,
		configured: false,
	});
	const [view, setView] = createSignal<View>("gallery");
	const [viewer, setViewer] = createSignal<Viewer | null>(null);
	const [loginOpen, setLoginOpen] = createSignal(false);
	const [uploadOpen, setUploadOpen] = createSignal(false);
	const [editing, setEditing] = createSignal<AddyPhoto | null>(null);
	const [toast, setToast] = createSignal<string | null>(null);
	const [loadError, setLoadError] = createSignal<string | null>(null);
	const [mounted, setMounted] = createSignal(false);
	const [darkroom, setDarkroom] = createSignal(false);
	const [progress, setProgress] = createSignal<{
		done: number;
		total: number;
	} | null>(null);
	const [now] = createDateNow(60_000);

	const readDarkroom = () => {
		try {
			return window.localStorage.getItem("addy-darkroom") === "1";
		} catch {
			// Storage can be blocked (private mode, partitioned third parties).
			return false;
		}
	};
	const writeDarkroom = (value: boolean) => {
		try {
			window.localStorage.setItem("addy-darkroom", value ? "1" : "0");
		} catch {
			// The theme just won't stick between visits.
		}
	};

	let toastTimer: number | undefined;
	const say = (message: string) => {
		setToast(message);
		if (toastTimer) window.clearTimeout(toastTimer);
		toastTimer = window.setTimeout(() => setToast(null), 4200);
	};

	const refresh = async () => {
		try {
			const data = await fetchPhotos();
			setPhotos(data.photos);
			setLoadError(null);
			setSession((current) => ({
				...current,
				configured: data.configured,
			}));
		} catch (error) {
			setLoadError(errorText(error));
		}
	};

	onSettled(() => {
		if (typeof window === "undefined") return;
		setMounted(true);
		setDarkroom(readDarkroom());
		setView(viewFromHash());
		const onHash = () => setView(viewFromHash());
		const onPop = () => closeViewer(true);
		window.addEventListener("hashchange", onHash);
		window.addEventListener("popstate", onPop);
		void refresh();
		void fetchSession()
			.then(setSession)
			.catch(() => {
				// The page works without a session; uploads just stay locked.
			});
		return () => {
			window.removeEventListener("hashchange", onHash);
			window.removeEventListener("popstate", onPop);
			if (toastTimer) window.clearTimeout(toastTimer);
		};
	});

	const setDark = (value: boolean) => {
		setDarkroom(value);
		writeDarkroom(value);
	};

	const allPhotos = () => sortedNewest(photos() ?? []);
	const loading = () => photos() === null;
	const placeCount = createMemo(() => {
		const count = groupPlaces(photos() ?? []).length;
		return count > 0 ? count : null;
	});
	const anniversary = createMemo(() =>
		mounted() ? anniversaryLabel(now()) : null,
	);

	const selectView = (next: View) => {
		setView(next);
		if (typeof window !== "undefined")
			window.history.replaceState(
				null,
				"",
				next === "gallery"
					? `${window.location.pathname}${window.location.search}`
					: `#${next}`,
			);
		document
			.getElementById("photos")
			?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	const openPhoto = (photo: AddyPhoto, list: AddyPhoto[]) => {
		const index = list.findIndex((entry) => entry.id === photo.id);
		const opening = viewer() === null;
		setViewer({ list, index: Math.max(0, index) });
		// Give the phone's back gesture something to close. The URL stays put,
		// so this entry is just a second copy of the page underneath the viewer.
		if (opening && typeof window !== "undefined")
			window.history.pushState(
				{ ...(window.history.state ?? {}), addyPhoto: true },
				"",
			);
	};

	const closeViewer = (viaHistory = false) => {
		if (!viewer()) return;
		// The edit sheet can be sitting on top of the viewer; close both.
		setEditing(null);
		const pop =
			!viaHistory &&
			typeof window !== "undefined" &&
			window.history.state?.addyPhoto === true;
		setViewer(null);
		if (pop) window.history.back();
	};

	const openRandom = () => {
		const list = allPhotos();
		if (list.length === 0) {
			say("Nothing in the pile yet. Add the first one?");
			return;
		}
		openPhoto(list[Math.floor(Math.random() * list.length)], list);
	};

	const requestUpload = () => {
		if (!session().configured) {
			say("Uploads aren't switched on yet. They need ADDY_PASSWORD.");
			return;
		}
		if (!session().authenticated) {
			setLoginOpen(true);
			return;
		}
		setUploadOpen(true);
	};

	const applyPhoto = (photo: AddyPhoto) => {
		setPhotos(
			(current) =>
				current?.map((entry) => (entry.id === photo.id ? photo : entry)) ??
				null,
		);
		setViewer((current) =>
			current
				? {
						...current,
						list: current.list.map((entry) =>
							entry.id === photo.id ? photo : entry,
						),
					}
				: null,
		);
	};

	const dropPhoto = (id: string) => {
		setPhotos((current) => current?.filter((entry) => entry.id !== id) ?? null);
		closeViewer();
	};

	const deleteFromViewer = async (photo: AddyPhoto) => {
		if (!window.confirm("Delete this photo? This can't be undone.")) return;
		try {
			await removePhoto(photo.id);
			dropPhoto(photo.id);
			say("Photo deleted.");
		} catch (error) {
			say(errorText(error));
		}
	};

	const downloadAll = async () => {
		const list = allPhotos();
		if (progress() !== null) return;
		if (list.length === 0) {
			say("Nothing to download yet.");
			return;
		}
		setProgress({ done: 0, total: list.length });
		try {
			const { skipped } = await downloadAlbum(list, (done, total) =>
				setProgress({ done, total }),
			);
			say(
				skipped > 0
					? `Album downloaded, but ${skipped} ${skipped === 1 ? "photo" : "photos"} wouldn't open.`
					: "Album downloaded.",
			);
		} catch (error) {
			say(errorText(error));
		} finally {
			setProgress(null);
		}
	};

	const signOut = async () => {
		try {
			await logout();
			setSession((current) => ({ ...current, authenticated: false }));
			say("Signed out.");
		} catch (error) {
			say(errorText(error));
		}
	};

	const toggleDarkroom = () => setDark(!darkroom());

	return (
		<div class="addy" data-darkroom={darkroom() ? "true" : undefined}>
			<Title>A really cute model</Title>
			<Meta name="robots" content="noindex" />
			<Meta name="theme-color" content={darkroom() ? "#15110d" : "#f7f1e5"} />
			<Meta
				name="description"
				content="A small photo album for Addy and Oscar. The good bits, in the order they happened."
			/>

			<div class="grain" aria-hidden="true" />

			<header class="topbar">
				<div class="topbar-inner">
					<button
						type="button"
						class="wordmark"
						onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
						aria-label="Back to the top"
					>
						A<span>&amp;</span>O
					</button>

					<nav class="tabs" aria-label="Ways to see the photos">
						<button
							type="button"
							class={["tab", { active: view() === "gallery" }]}
							aria-current={view() === "gallery" ? "page" : undefined}
							onClick={() => selectView("gallery")}
						>
							Gallery
						</button>
						<button
							type="button"
							class={["tab", { active: view() === "timeline" }]}
							aria-current={view() === "timeline" ? "page" : undefined}
							onClick={() => selectView("timeline")}
						>
							Timeline
						</button>
						<button
							type="button"
							class={["tab", { active: view() === "places" }]}
							aria-current={view() === "places" ? "page" : undefined}
							onClick={() => selectView("places")}
						>
							Places
						</button>
					</nav>

					<div class="top-actions">
						<button
							type="button"
							class="icon-button"
							onClick={toggleDarkroom}
							aria-label={darkroom() ? "Turn the lights on" : "Dim the lights"}
							title={darkroom() ? "Turn the lights on" : "Dim the lights"}
						>
							<Icon name={darkroom() ? "sun" : "moon"} size={18} />
						</button>
						<button
							type="button"
							class="icon-button"
							onClick={downloadAll}
							aria-label="Download the whole album"
							title="Download the whole album"
							disabled={progress() !== null}
						>
							<Icon name="download" size={18} />
						</button>
						<Show when={session().configured}>
							<button
								type="button"
								class="button solid small"
								onClick={requestUpload}
							>
								<Icon name="upload" size={15} />
								<span>{session().authenticated ? "Upload" : "Log in"}</span>
							</button>
						</Show>
					</div>
				</div>
			</header>

			<main>
				<Hero
					photos={allPhotos()}
					days={daysTogether(now())}
					places={placeCount()}
					anniversary={anniversary()}
					onShuffle={openRandom}
					onTimeline={() => selectView("timeline")}
					onUpload={requestUpload}
					onOpen={(photo) => openPhoto(photo, allPhotos())}
					canUpload={session().configured}
				/>

				<Show when={loadError()}>
					{(message) => (
						<div class="load-error">
							<p>{message()}</p>
							<button
								type="button"
								class="button line"
								onClick={() => {
									setLoadError(null);
									void refresh();
								}}
							>
								Try again
							</button>
						</div>
					)}
				</Show>

				<section class="photos" id="photos">
					<Switch>
						<Match when={view() === "gallery"}>
							<Gallery
								photos={allPhotos()}
								loading={loading()}
								onOpen={openPhoto}
								onUpload={requestUpload}
								canUpload={session().configured}
							/>
						</Match>
						<Match when={view() === "timeline"}>
							<Timeline
								photos={allPhotos()}
								loading={loading()}
								onOpen={openPhoto}
								onUpload={requestUpload}
								canUpload={session().configured}
							/>
						</Match>
						<Match when={view() === "places"}>
							<Places
								photos={allPhotos()}
								loading={loading()}
								onOpen={openPhoto}
								onUpload={requestUpload}
								canUpload={session().configured}
							/>
						</Match>
					</Switch>
				</section>
			</main>

			<footer class="footer">
				<div>
					<p class="footer-mark">A &amp; O</p>
					<p>A small internet place for two people. Since 20 June 2025.</p>
				</div>
				<div class="footer-links">
					<Show
						when={session().authenticated}
						fallback={
							<Show when={session().configured}>
								<button
									type="button"
									class="link-button"
									onClick={() => setLoginOpen(true)}
								>
									Oscar or Addy? Sign in
								</button>
							</Show>
						}
					>
						<button type="button" class="link-button" onClick={signOut}>
							Sign out
						</button>
					</Show>
					<button
						type="button"
						class="link-button"
						onClick={downloadAll}
						disabled={progress() !== null}
					>
						Download the whole album
					</button>
					<span>Made by Oscar, mostly at night.</span>
				</div>
			</footer>

			<Show when={viewer()}>
				{(current) => (
					<Lightbox
						photos={current().list}
						index={current().index}
						onIndex={(index) =>
							setViewer((value) => (value ? { ...value, index } : null))
						}
						onClose={() => closeViewer()}
						onEdit={(photo) => setEditing(photo)}
						onDelete={deleteFromViewer}
						authenticated={session().authenticated}
					/>
				)}
			</Show>

			<Show when={loginOpen()}>
				<LoginSheet
					onClose={() => setLoginOpen(false)}
					onSuccess={() => {
						setSession((current) => ({ ...current, authenticated: true }));
						setLoginOpen(false);
						setUploadOpen(true);
						say("Welcome in.");
					}}
				/>
			</Show>

			<Show when={uploadOpen()}>
				<UploadSheet
					onClose={() => setUploadOpen(false)}
					onUploaded={(added) => {
						// The upload response is the complete record, so merge it in
						// instead of refetching (and rebuilding) the whole album.
						setPhotos((current) => (current ? [...added, ...current] : added));
						say(
							`${added.length} ${added.length === 1 ? "photo" : "photos"} added.`,
						);
					}}
				/>
			</Show>

			<Show when={editing()}>
				{(photo) => (
					<EditSheet
						photo={photo()}
						onClose={() => setEditing(null)}
						onSaved={(updated) => {
							applyPhoto(updated);
							say("Saved.");
						}}
						onDeleted={(id) => {
							dropPhoto(id);
							say("Photo deleted.");
						}}
					/>
				)}
			</Show>

			<Show when={progress()}>
				{(state) => (
					<div class="progress-pill" role="status">
						<span class="spinner small" />
						Packing photos… {state().done}/{state().total}
					</div>
				)}
			</Show>

			<Show when={toast()}>
				{(text) => (
					<div class="toast" role="status">
						{text()}
					</div>
				)}
			</Show>
		</div>
	);
}
