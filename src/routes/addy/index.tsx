import { Meta, Title } from "@solidjs/meta";
import { defineFileRoute } from "@solidjs/router/fs";
import { getRequestEvent } from "@solidjs/web";
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
	clearCover,
	downloadAlbum,
	fetchPhotos,
	fetchSession,
	logout,
	removePhoto,
	type SessionState,
	setCover,
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
type LoginIntent = "view" | "upload";

const COVER_URL = "/addy/cover";

function viewFromHash(): View {
	if (typeof window === "undefined") return "gallery";
	const hash = window.location.hash.replace("#", "");
	return hash === "timeline" || hash === "places" ? hash : "gallery";
}

function errorText(error: unknown): string {
	return error instanceof Error ? error.message : "Something went wrong.";
}

/**
 * The auth state has to be identical on both sides of hydration, or Solid
 * tears the server-rendered page down and rebuilds it (and the reactive system
 * halts). The server knows the answer from the request; the client reads the
 * marker the server wrote into the page, so both start from the same value.
 * After that the session check in `onSettled` keeps it honest.
 */
function initialSession(): SessionState {
	if (typeof document === "undefined") {
		try {
			return {
				authenticated: getRequestEvent()?.locals.addyAuthenticated === true,
			};
		} catch {
			return { authenticated: false };
		}
	}
	const marker = document.querySelector("[data-addy-session]");
	return { authenticated: marker?.getAttribute("data-addy-session") === "in" };
}

export default function Page() {
	const [photos, setPhotos] = createSignal<AddyPhoto[] | null>(null);
	const [session, setSession] = createSignal<SessionState>(initialSession());
	const [coverId, setCoverId] = createSignal<string | null>(null);
	const [view, setView] = createSignal<View>("gallery");
	const [viewer, setViewer] = createSignal<Viewer | null>(null);
	const [loginOpen, setLoginOpen] = createSignal(false);
	const [loginIntent, setLoginIntent] = createSignal<LoginIntent>("view");
	const [uploadOpen, setUploadOpen] = createSignal(false);
	const [editing, setEditing] = createSignal<AddyPhoto | null>(null);
	const [toast, setToast] = createSignal<string | null>(null);
	const [loadError, setLoadError] = createSignal<string | null>(null);
	const [mounted, setMounted] = createSignal(false);
	const [progress, setProgress] = createSignal<{
		done: number;
		total: number;
	} | null>(null);
	const [now] = createDateNow(60_000);

	let toastTimer: number | undefined;
	const say = (message: string) => {
		setToast(message);
		if (toastTimer) window.clearTimeout(toastTimer);
		toastTimer = window.setTimeout(() => setToast(null), 4200);
	};

	const authenticated = () => session().authenticated;
	const locked = () => !session().authenticated;

	const refresh = async () => {
		try {
			const data = await fetchPhotos();
			setPhotos(data.photos);
			setCoverId(data.coverId);
			setLoadError(null);
		} catch (error) {
			setLoadError(errorText(error));
		}
	};

	onSettled(() => {
		if (typeof window === "undefined") return;
		setMounted(true);
		setView(viewFromHash());
		const onHash = () => setView(viewFromHash());
		const onPop = () => closeViewer(true);
		window.addEventListener("hashchange", onHash);
		window.addEventListener("popstate", onPop);
		// Ask who we are first: the photos endpoint only returns the album to a
		// signed-in visitor.
		void fetchSession()
			.then((state) => {
				setSession(state);
			})
			.catch(() => {
				// Stay locked. The landing page renders either way.
			})
			.finally(() => void refresh());
		return () => {
			window.removeEventListener("hashchange", onHash);
			window.removeEventListener("popstate", onPop);
			if (toastTimer) window.clearTimeout(toastTimer);
		};
	});

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

	const requestLogin = (intent: LoginIntent = "view") => {
		setLoginIntent(intent);
		setLoginOpen(true);
	};

	const requestUpload = () => {
		if (!authenticated()) {
			requestLogin("upload");
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
		if (coverId() === id) setCoverId(null);
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

	const pinCover = async (photo: AddyPhoto) => {
		try {
			const id = await setCover(photo.id);
			setCoverId(id);
			say("That one is on the front page now.");
		} catch (error) {
			say(errorText(error));
		}
	};

	const unpinCover = async () => {
		try {
			await clearCover();
			setCoverId(null);
			say("Back to showing the newest photo.");
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
			setSession({ authenticated: false });
			setPhotos([]);
			setCoverId(null);
			setViewer(null);
			say("Signed out.");
		} catch (error) {
			say(errorText(error));
		}
	};

	return (
		<div
			class={["addy", { "addy-locked": locked() }]}
			data-addy-session={authenticated() ? "in" : "out"}
		>
			<Title>A really cute model</Title>
			<Meta name="robots" content="noindex" />
			<Meta name="theme-color" content="#f7f1e5" />
			<Meta
				name="description"
				content="A small photo album for Addy and Oscar. The good bits, in the order they happened."
			/>

			<div class="grain" aria-hidden="true" />

			<Show when={authenticated()}>
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
								class="button solid small"
								onClick={requestUpload}
							>
								<Icon name="upload" size={15} />
								<span>Upload</span>
							</button>
						</div>
					</div>
				</header>
			</Show>

			<main>
				<Hero
					photos={allPhotos()}
					days={daysTogether(now())}
					places={placeCount()}
					anniversary={anniversary()}
					onShuffle={openRandom}
					onTimeline={() => selectView("timeline")}
					onUpload={requestUpload}
					onLogin={() => requestLogin()}
					onOpen={(photo) => openPhoto(photo, allPhotos())}
					locked={locked()}
					coverUrl={COVER_URL}
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

				<Show when={authenticated()}>
					<section class="photos" id="photos">
						<div class="album-bar">
							<div>
								<p class="kicker">The private part</p>
								<p class="album-bar-copy">
									Everything the two of us have kept so far.
								</p>
							</div>
							<div class="album-bar-actions">
								<button
									type="button"
									class="button line small"
									onClick={requestUpload}
								>
									<Icon name="upload" size={15} />
									Add photos
								</button>
								<button
									type="button"
									class="button line small"
									onClick={downloadAll}
									disabled={progress() !== null}
								>
									<Icon name="download" size={15} />
									{progress()
										? `Packing ${progress()?.done}/${progress()?.total}`
										: "Download album"}
								</button>
							</div>
						</div>

						<Switch>
							<Match when={view() === "gallery"}>
								<Gallery
									photos={allPhotos()}
									loading={loading()}
									onOpen={openPhoto}
									onUpload={requestUpload}
								/>
							</Match>
							<Match when={view() === "timeline"}>
								<Timeline
									photos={allPhotos()}
									loading={loading()}
									onOpen={openPhoto}
									onUpload={requestUpload}
								/>
							</Match>
							<Match when={view() === "places"}>
								<Places
									photos={allPhotos()}
									loading={loading()}
									onOpen={openPhoto}
									onUpload={requestUpload}
								/>
							</Match>
						</Switch>
					</section>
				</Show>
			</main>

			<Show when={authenticated()}>
				<footer class="footer">
					<div>
						<p class="footer-mark">A &amp; O</p>
						<p>A small internet place for two people. Since 20 June 2025.</p>
					</div>
					<div class="footer-links">
						<button type="button" class="link-button" onClick={signOut}>
							Sign out
						</button>
						<span>Made by Oscar, mostly on crack.</span>
					</div>
				</footer>
			</Show>

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
						coverId={coverId()}
						onSetCover={pinCover}
						onClearCover={unpinCover}
					/>
				)}
			</Show>

			<Show when={loginOpen()}>
				<LoginSheet
					onClose={() => setLoginOpen(false)}
					onSuccess={() => {
						const intent = loginIntent();
						setSession({ authenticated: true });
						setLoginOpen(false);
						void refresh();
						if (intent === "upload") setUploadOpen(true);
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
