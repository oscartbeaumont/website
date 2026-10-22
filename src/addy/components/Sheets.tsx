import {
	createSignal,
	For,
	onCleanup,
	onSettled,
	type ParentProps,
	Show,
	untrack,
} from "solid-js";
import { coordinateLabel } from "../album";
import {
	login,
	type PhotoPatch,
	type PreparedPhoto,
	patchPhoto,
	preparePhoto,
	removePhoto,
	uploadPhoto,
} from "../client";
import { trapFocus } from "../focus";
import { lockBodyScroll } from "../scroll-lock";
import type { AddyPhoto } from "../store";
import { Icon } from "./Icons";

function message(error: unknown): string {
	return error instanceof Error ? error.message : "Something went wrong.";
}

function localInputValue(date: Date): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
		date.getDate(),
	)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function Sheet(
	props: ParentProps<{
		kicker: string;
		title: string;
		note?: string;
		onClose: () => void;
		wide?: boolean;
	}>,
) {
	let sheet: HTMLDivElement | undefined;

	onSettled(() => {
		const releaseFocus = trapFocus(sheet);
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") props.onClose();
		};
		document.addEventListener("keydown", onKey);
		const unlock = lockBodyScroll();
		return () => {
			document.removeEventListener("keydown", onKey);
			releaseFocus();
			unlock();
		};
	});

	return (
		<div class="sheet-backdrop">
			<button
				type="button"
				class="sheet-scrim"
				tabindex={-1}
				onClick={props.onClose}
				aria-label="Close dialog"
			/>
			<div
				ref={sheet}
				class={["sheet", { wide: props.wide === true }]}
				role="dialog"
				aria-modal="true"
				aria-label={props.title}
			>
				<button
					type="button"
					class="sheet-close icon-button"
					onClick={props.onClose}
					aria-label="Close"
				>
					<Icon name="close" size={20} />
				</button>
				<header class="sheet-head">
					<p class="kicker">{props.kicker}</p>
					<h2>{props.title}</h2>
					<Show when={props.note}>
						<p class="sheet-note">{props.note}</p>
					</Show>
				</header>
				{props.children}
			</div>
		</div>
	);
}

export function LoginSheet(props: {
	onClose: () => void;
	onSuccess: () => void;
}) {
	const [password, setPassword] = createSignal("");
	const [error, setError] = createSignal<string | null>(null);
	const [busy, setBusy] = createSignal(false);
	let input: HTMLInputElement | undefined;

	onSettled(() => input?.focus());

	const submit = async (event: SubmitEvent) => {
		event.preventDefault();
		if (busy()) return;
		setBusy(true);
		setError(null);
		try {
			await login(password());
			props.onSuccess();
		} catch (problem) {
			setError(message(problem));
		} finally {
			setBusy(false);
		}
	};

	return (
		<Sheet
			kicker="Just for us"
			title="Sign in"
			note="One password between the two of us. It opens the photos, the uploads, and the delete button."
			onClose={props.onClose}
		>
			<form class="sheet-form" onSubmit={submit}>
				<label class="field">
					<span>Password</span>
					<input
						ref={input}
						type="password"
						autocomplete="current-password"
						value={password()}
						onInput={(event) => setPassword(event.currentTarget.value)}
						placeholder="••••••••"
					/>
				</label>
				<Show when={error()}>
					<p class="field-error">{error()}</p>
				</Show>
				<div class="sheet-actions">
					<button class="button solid" type="submit" disabled={busy()}>
						<Icon name="lock" size={16} />
						{busy() ? "Checking…" : "Sign in"}
					</button>
					<button class="button quiet" type="button" onClick={props.onClose}>
						Never mind
					</button>
				</div>
			</form>
		</Sheet>
	);
}

type UploadStatus = "preparing" | "ready" | "uploading" | "done" | "error";

type UploadItem = {
	key: string;
	name: string;
	status: UploadStatus;
	error?: string;
	prepared?: PreparedPhoto;
	preview?: string;
	caption: string;
	takenAt: string;
	place: string;
	/** The place the server worked out for us, shown once it is stored. */
	uploadedPlace?: string;
};

export function UploadSheet(props: {
	onClose: () => void;
	onUploaded: (photos: AddyPhoto[]) => void;
}) {
	const [items, setItems] = createSignal<UploadItem[]>([]);
	const [dragging, setDragging] = createSignal(false);
	const [busy, setBusy] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);
	let fileInput: HTMLInputElement | undefined;
	let disposed = false;
	let queue: Promise<void> = Promise.resolve();

	const update = (key: string, patch: Partial<UploadItem>) => {
		setItems((current) =>
			current.map((item) => (item.key === key ? { ...item, ...patch } : item)),
		);
	};

	/**
	 * Prepare one file at a time. Decoding a dozen phone photos at once can
	 * exhaust a phone's memory before anything is uploaded.
	 */
	const addFiles = (files: FileList | File[]) => {
		for (const file of Array.from(files)) {
			const key = crypto.randomUUID();
			setItems((current) => [
				...current,
				{
					key,
					name: file.name,
					status: "preparing",
					caption: "",
					takenAt: "",
					place: "",
				},
			]);
			queue = queue.then(async () => {
				if (disposed) return;
				try {
					const prepared = await preparePhoto(file);
					if (disposed || !items().some((entry) => entry.key === key)) {
						URL.revokeObjectURL(prepared.previewUrl);
						return;
					}
					const fallback = new Date(file.lastModified || Date.now());
					update(key, {
						status: "ready",
						prepared,
						preview: prepared.previewUrl,
						takenAt:
							prepared.exif.takenAt?.slice(0, 16) ?? localInputValue(fallback),
					});
				} catch (problem) {
					if (!disposed)
						update(key, { status: "error", error: message(problem) });
				}
			});
		}
	};

	onCleanup(() => {
		disposed = true;
		for (const item of items())
			if (item.preview) URL.revokeObjectURL(item.preview);
	});

	const readyCount = () =>
		items().filter((item) => item.status === "ready").length;
	const preparing = () => items().some((item) => item.status === "preparing");

	const submit = async () => {
		if (busy() || preparing()) return;
		setBusy(true);
		setError(null);
		const added: AddyPhoto[] = [];
		for (const item of items()) {
			if (item.status !== "ready" || !item.prepared) continue;
			update(item.key, { status: "uploading" });
			try {
				const photo = await uploadPhoto(item.prepared, {
					caption: item.caption.trim(),
					takenAt: item.takenAt || null,
					place: item.place.trim(),
				});
				added.push(photo);
				update(item.key, {
					status: "done",
					// The server is the one that names a place, so show what it
					// decided rather than what the form guessed.
					uploadedPlace: photo.place ?? undefined,
				});
			} catch (problem) {
				update(item.key, { status: "error", error: message(problem) });
			}
		}
		setBusy(false);
		if (added.length > 0) props.onUploaded(added);
		const stillPending = items().some(
			(item) =>
				item.status === "ready" ||
				item.status === "preparing" ||
				item.status === "error",
		);
		if (added.length > 0 && !stillPending) props.onClose();
		else if (added.length === 0)
			setError("None of those made it. Have a look below.");
	};

	return (
		<Sheet
			kicker="A fresh roll"
			title="Add to the pile"
			note="Drop a few in. We read the date and place from the photo, and you can correct us before it goes up."
			onClose={props.onClose}
			wide
		>
			<label
				class={["dropzone", { over: dragging() }]}
				onDragOver={(event) => {
					event.preventDefault();
					setDragging(true);
				}}
				onDragLeave={(event) => {
					if (!event.currentTarget.contains(event.relatedTarget as Node | null))
						setDragging(false);
				}}
				onDrop={(event) => {
					event.preventDefault();
					setDragging(false);
					if (event.dataTransfer?.files) addFiles(event.dataTransfer.files);
				}}
			>
				<input
					ref={fileInput}
					type="file"
					accept="image/*"
					multiple
					onChange={(event) => {
						if (event.currentTarget.files) addFiles(event.currentTarget.files);
						event.currentTarget.value = "";
					}}
				/>
				<Icon name="upload" size={24} />
				<strong>Drop a roll here</strong>
				<span>or choose photos · JPEG, PNG, WebP · up to 40 MB each</span>
			</label>

			<Show when={items().length > 0}>
				<div class="upload-list">
					<For each={items()}>
						{(item) => (
							<div class="upload-row">
								<div class="upload-preview">
									<Show
										when={item.preview}
										fallback={
											<Show
												when={item.status === "error"}
												fallback={<span class="spinner" />}
											>
												<Icon name="close" size={18} />
											</Show>
										}
									>
										{(preview) => <img src={preview()} alt="" />}
									</Show>
								</div>
								<div class="upload-fields">
									<p class="upload-name">{item.name}</p>
									<Show
										when={
											item.status === "ready" ||
											item.status === "uploading" ||
											item.status === "done"
										}
									>
										<label class="field">
											<span>Caption</span>
											<input
												value={item.caption}
												maxlength={280}
												disabled={item.status !== "ready"}
												placeholder="Say something about this one"
												onInput={(event) =>
													update(item.key, {
														caption: event.currentTarget.value,
													})
												}
											/>
										</label>
										<div class="field-row">
											<label class="field">
												<span>Taken</span>
												<input
													type="datetime-local"
													value={item.takenAt}
													disabled={item.status !== "ready"}
													onInput={(event) =>
														update(item.key, {
															takenAt: event.currentTarget.value,
														})
													}
												/>
											</label>
											<label class="field">
												<span>Place</span>
												<input
													value={item.place}
													maxlength={80}
													disabled={item.status !== "ready"}
													placeholder="Where was this?"
													onInput={(event) =>
														update(item.key, {
															place: event.currentTarget.value,
														})
													}
												/>
											</label>
										</div>
										<Show
											when={item.prepared && item.prepared.exif.lat !== null}
											fallback={
												<Show when={item.place.trim().length > 2}>
													<p class="field-hint">
														<Icon name="pin" size={12} />
														We&rsquo;ll look that place up on the map
													</p>
												</Show>
											}
										>
											<p class="field-hint">
												<Icon name="pin" size={12} />
												Location in the photo ·{" "}
												{coordinateLabel(
													item.prepared?.exif.lat ?? 0,
													item.prepared?.exif.lng ?? 0,
												)}
											</p>
										</Show>
									</Show>
									<Show when={item.status === "uploading"}>
										<p class="field-hint">Uploading…</p>
									</Show>
									<Show when={item.status === "done"}>
										<p class="field-hint done">
											<Icon name="check" size={13} /> Added
											<Show when={item.uploadedPlace}>
												{(place) => <span> · {place()}</span>}
											</Show>
										</p>
									</Show>
									<Show when={item.status === "error"}>
										<p class="field-error">{item.error}</p>
										<Show when={item.prepared}>
											<button
												type="button"
												class="link-button"
												onClick={() =>
													update(item.key, {
														status: "ready",
														error: undefined,
													})
												}
											>
												Try again
											</button>
										</Show>
									</Show>
								</div>
								<button
									type="button"
									class="icon-button"
									onClick={() => {
										if (item.preview) URL.revokeObjectURL(item.preview);
										setItems((current) =>
											current.filter((entry) => entry.key !== item.key),
										);
									}}
									aria-label={`Remove ${item.name}`}
									disabled={item.status === "uploading"}
								>
									<Icon name="close" size={16} />
								</button>
							</div>
						)}
					</For>
				</div>
			</Show>

			<Show when={error()}>
				<p class="field-error">{error()}</p>
			</Show>

			<div class="sheet-actions">
				<button
					class="button line"
					type="button"
					onClick={() => fileInput?.click()}
				>
					<Icon name="camera" size={16} />
					{items().length > 0 ? "Choose more" : "Choose photos"}
				</button>
				<button
					class="button solid"
					type="button"
					disabled={busy() || preparing() || readyCount() === 0}
					onClick={submit}
				>
					<Icon name="upload" size={16} />
					{busy()
						? "Uploading…"
						: preparing()
							? "Getting them ready…"
							: readyCount() === 0
								? "Upload photos"
								: `Upload ${readyCount()} ${readyCount() === 1 ? "photo" : "photos"}`}
				</button>
			</div>
		</Sheet>
	);
}

export function EditSheet(props: {
	photo: AddyPhoto;
	onClose: () => void;
	onSaved: (photo: AddyPhoto) => void;
	onDeleted: (id: string) => void;
}) {
	const initial = untrack(() => ({
		caption: props.photo.caption,
		takenAt: props.photo.takenAt?.slice(0, 16) ?? "",
		place: props.photo.place ?? "",
	}));
	const [caption, setCaption] = createSignal(initial.caption);
	const [takenAt, setTakenAt] = createSignal(initial.takenAt);
	const [place, setPlace] = createSignal(initial.place);
	const [removeLocation, setRemoveLocation] = createSignal(false);
	const [busy, setBusy] = createSignal(false);
	const [error, setError] = createSignal<string | null>(null);

	const save = async (event: SubmitEvent) => {
		event.preventDefault();
		if (busy()) return;
		setBusy(true);
		setError(null);
		try {
			const patch: PhotoPatch = {
				caption: caption().trim(),
				takenAt: takenAt() || null,
				place: place().trim() || null,
			};
			if (removeLocation()) {
				patch.lat = null;
				patch.lng = null;
			}
			const updated = await patchPhoto(props.photo.id, patch);
			props.onSaved(updated);
			props.onClose();
		} catch (problem) {
			setError(message(problem));
		} finally {
			setBusy(false);
		}
	};

	const remove = async () => {
		if (!window.confirm("Delete this photo? This can't be undone.")) return;
		setBusy(true);
		try {
			await removePhoto(props.photo.id);
			props.onDeleted(props.photo.id);
			props.onClose();
		} catch (problem) {
			setError(message(problem));
			setBusy(false);
		}
	};

	return (
		<Sheet
			kicker="Fix the details"
			title="A little editing"
			note="Captions, dates, and places are all ours to change. The photo itself stays as it was."
			onClose={props.onClose}
		>
			<form class="sheet-form" onSubmit={save}>
				<label class="field">
					<span>Caption</span>
					<input
						value={caption()}
						maxlength={280}
						placeholder="Say something about this one"
						onInput={(event) => setCaption(event.currentTarget.value)}
					/>
				</label>
				<div class="field-row">
					<label class="field">
						<span>Taken</span>
						<input
							type="datetime-local"
							value={takenAt()}
							onInput={(event) => setTakenAt(event.currentTarget.value)}
						/>
					</label>
					<label class="field">
						<span>Place</span>
						<input
							value={place()}
							maxlength={80}
							placeholder="Perth"
							onInput={(event) => setPlace(event.currentTarget.value)}
						/>
					</label>
				</div>
				<Show when={props.photo.lat !== null}>
					<label class="check">
						<input
							type="checkbox"
							checked={removeLocation()}
							onChange={(event) =>
								setRemoveLocation(event.currentTarget.checked)
							}
						/>
						<span>Forget this photo's coordinates</span>
					</label>
				</Show>
				<Show when={error()}>
					<p class="field-error">{error()}</p>
				</Show>
				<div class="sheet-actions">
					<button class="button solid" type="submit" disabled={busy()}>
						{busy() ? "Saving…" : "Save changes"}
					</button>
					<Show when={!props.photo.legacy}>
						<button
							class="button quiet danger"
							type="button"
							onClick={remove}
							disabled={busy()}
						>
							<Icon name="trash" size={15} />
							Delete
						</button>
					</Show>
				</div>
			</form>
		</Sheet>
	);
}
