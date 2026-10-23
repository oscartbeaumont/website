import { createMemo, For, onSettled, Show } from "solid-js";
import { formatDay, formatTime } from "../album";
import { downloadPhoto } from "../client";
import { trapFocus } from "../focus";
import { lockBodyScroll } from "../scroll-lock";
import type { AddyPhoto } from "../store";
import { Icon } from "./Icons";

export function Lightbox(props: {
	photos: AddyPhoto[];
	index: number;
	onIndex: (index: number) => void;
	onClose: () => void;
	onEdit: (photo: AddyPhoto) => void;
	onDelete: (photo: AddyPhoto) => void;
	authenticated: boolean;
	/** The photo currently pinned to the logged-out landing page, if any. */
	coverId: string | null;
	onSetCover: (photo: AddyPhoto) => void;
	onClearCover: () => void;
}) {
	const photo = createMemo(() => props.photos[props.index]);
	const canPrev = () => props.index > 0;
	const canNext = () => props.index < props.photos.length - 1;
	const stripStart = () =>
		Math.max(0, Math.min(props.index - 4, props.photos.length - 9));
	const strip = () => props.photos.slice(stripStart(), stripStart() + 9);
	let closeButton: HTMLButtonElement | undefined;
	let dialog: HTMLDivElement | undefined;

	const move = (delta: number) => {
		const next = props.index + delta;
		if (next >= 0 && next < props.photos.length) props.onIndex(next);
	};

	onSettled(() => {
		const releaseFocus = trapFocus(dialog, closeButton);
		const onKey = (event: KeyboardEvent) => {
			// A sheet can sit on top of the viewer; it gets the keys first.
			const target = event.target;
			if (target instanceof Element && target.closest(".sheet-backdrop"))
				return;
			if (event.key === "Escape") props.onClose();
			if (event.key === "ArrowLeft") move(-1);
			if (event.key === "ArrowRight") move(1);
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
		<Show when={photo()}>
			{(current) => (
				<div
					ref={dialog}
					class="lightbox"
					role="dialog"
					aria-modal="true"
					aria-label="Photo viewer"
				>
					<button
						ref={closeButton}
						type="button"
						class="lb-close"
						onClick={props.onClose}
						aria-label="Close photo"
					>
						<Icon name="close" size={22} />
					</button>

					<div class="lb-stage">
						<Show when={canPrev()}>
							<button
								type="button"
								class="lb-nav prev"
								onClick={() => move(-1)}
								aria-label="Previous photo"
							>
								<Icon name="arrow-left" size={22} />
							</button>
						</Show>
						<img
							class="lb-image"
							src={current().displayUrl}
							alt={current().caption || "A memory of us"}
							width={current().width ?? undefined}
							height={current().height ?? undefined}
						/>
						<Show when={canNext()}>
							<button
								type="button"
								class="lb-nav next"
								onClick={() => move(1)}
								aria-label="Next photo"
							>
								<Icon name="arrow-right" size={22} />
							</button>
						</Show>
					</div>

					<aside class="lb-panel">
						<div class="lb-topline">
							<span>
								{props.index + 1} / {props.photos.length}
							</span>
						</div>

						<Show when={current().caption}>
							<h2 class="lb-caption">{current().caption}</h2>
						</Show>

						<div class="lb-meta">
							<p>{formatDay(current().takenAt)}</p>
							<Show when={formatTime(current().takenAt)}>
								{(time) => <p>{time()}</p>}
							</Show>
							<Show when={current().place}>
								<p class="lb-place">
									<Icon name="pin" size={13} />
									{current().place}
								</p>
							</Show>
						</div>

						<div class="lb-actions">
							<button
								type="button"
								class="button line light"
								onClick={() => downloadPhoto(current())}
							>
								<Icon name="download" size={16} />
								Download
							</button>
							<Show when={props.authenticated}>
								<button
									type="button"
									class="button line light"
									onClick={() => props.onEdit(current())}
								>
									<Icon name="pencil" size={15} />
									Edit
								</button>
								<Show
									when={props.coverId === current().id}
									fallback={
										<button
											type="button"
											class="button line light"
											onClick={() => props.onSetCover(current())}
										>
											<Icon name="star" size={15} />
											Front page
										</button>
									}
								>
									<button
										type="button"
										class="button line light"
										onClick={props.onClearCover}
									>
										<Icon name="star" size={15} />
										On the front page
									</button>
								</Show>
								<Show when={!current().legacy}>
									<button
										type="button"
										class="button line light danger"
										onClick={() => props.onDelete(current())}
									>
										<Icon name="trash" size={15} />
										Delete
									</button>
								</Show>
							</Show>
						</div>

						<Show when={props.authenticated && props.coverId === null}>
							<p class="lb-note">
								The front page is the one photo anyone can see without signing
								in. Tap “Front page” to put this one on it.
							</p>
						</Show>

						<div class="lb-strip">
							<For each={strip()}>
								{(thumb, index) => (
									<button
										type="button"
										class={[
											"lb-thumb",
											{
												active: stripStart() + index() === props.index,
											},
										]}
										onClick={() => props.onIndex(stripStart() + index())}
										aria-label={`Photo ${stripStart() + index() + 1}`}
									>
										<img src={thumb.thumbUrl} alt="" loading="lazy" />
									</button>
								)}
							</For>
						</div>

						<p class="lb-hint">← → to move · Esc to close</p>
					</aside>
				</div>
			)}
		</Show>
	);
}
