import { For, Show } from "solid-js";
import { formatDay, photoTilt } from "../album";
import type { AddyPhoto } from "../store";
import { Icon } from "./Icons";

export function Gallery(props: {
	photos: AddyPhoto[];
	onOpen: (photo: AddyPhoto, list: AddyPhoto[]) => void;
	onUpload: () => void;
	canUpload: boolean;
	loading: boolean;
}) {
	return (
		<>
			<div class="section-head">
				<div>
					<p class="kicker">Gallery</p>
					<h2 class="section-title">The pile</h2>
				</div>
				<p class="section-meta">
					<Show when={!props.loading} fallback="Fetching the good ones…">
						{props.photos.length}{" "}
						{props.photos.length === 1 ? "photo" : "photos"} · newest first
					</Show>
				</p>
			</div>

			<Show
				when={!props.loading}
				fallback={
					<div class="pile" aria-hidden="true">
						<For each={[0, 1, 2, 3, 4, 5, 6, 7]}>
							{(index) => (
								<div
									class="pile-skeleton"
									style={{
										"aspect-ratio": index % 3 === 0 ? "4 / 5" : "1 / 1",
									}}
								/>
							)}
						</For>
					</div>
				}
			>
				<Show
					when={props.photos.length > 0}
					fallback={
						<div class="empty-card">
							<Icon name="camera" size={30} />
							<h3>The pile is empty</h3>
							<p>
								Add the first photo. It lands here with its date, and we can
								argue about the caption later.
							</p>
							<Show when={props.canUpload}>
								<button
									class="button solid"
									type="button"
									onClick={props.onUpload}
								>
									<Icon name="upload" size={16} />
									Add the first one
								</button>
							</Show>
						</div>
					}
				>
					<div class="pile">
						<For each={props.photos}>
							{(photo, index) => (
								<figure
									class="pile-item"
									style={`--tilt: ${photoTilt(photo.id)}deg`}
								>
									<button
										type="button"
										class="photo-button"
										onClick={() => props.onOpen(photo, props.photos)}
										aria-label={
											photo.caption
												? `Open ${photo.caption}`
												: "Open this photo"
										}
									>
										<img
											src={photo.thumbUrl}
											alt={photo.caption || "A memory of us"}
											width={photo.width ?? undefined}
											height={photo.height ?? undefined}
											loading={index() < 6 ? "eager" : "lazy"}
											decoding="async"
											style={{
												"aspect-ratio":
													photo.width && photo.height
														? `${photo.width} / ${photo.height}`
														: undefined,
											}}
										/>
										<Show when={photo.legacy}>
											<span class="first-roll">first roll</span>
										</Show>
										<span class="photo-open" aria-hidden="true">
											Open
										</span>
									</button>
									<figcaption>
										<span class="caption">
											{photo.caption || photo.place || "One for the pile"}
										</span>
										<span class="caption-meta">{formatDay(photo.takenAt)}</span>
									</figcaption>
								</figure>
							)}
						</For>
					</div>
				</Show>
			</Show>
		</>
	);
}
