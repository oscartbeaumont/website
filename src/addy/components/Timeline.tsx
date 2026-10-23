import { createMemo, For, Show } from "solid-js";
import { formatDay, groupByMonth } from "../album";
import type { AddyPhoto } from "../store";
import { Icon } from "./Icons";

export function Timeline(props: {
	photos: AddyPhoto[];
	onOpen: (photo: AddyPhoto, list: AddyPhoto[]) => void;
	onUpload: () => void;
	loading: boolean;
}) {
	const groups = () => groupByMonth(props.photos);
	const alternation = createMemo(() => {
		const order = new Map<string, number>();
		let index = 0;
		for (const group of groups().months)
			for (const photo of group.photos) order.set(photo.id, index++);
		return order;
	});

	return (
		<>
			<div class="section-head">
				<div>
					<p class="kicker">Timeline</p>
					<h2 class="section-title">In the order it happened</h2>
				</div>
			</div>

			<Show
				when={!props.loading && props.photos.length > 0}
				fallback={
					<Show when={!props.loading}>
						<div class="empty-card">
							<Icon name="compass" size={30} />
							<h3>Nothing on the timeline yet</h3>
							<p>
								Photos keep the date they were taken. Add one, or give an old
								photo a date, and the timeline starts itself.
							</p>
							<button
								class="button solid"
								type="button"
								onClick={props.onUpload}
							>
								<Icon name="upload" size={16} />
								Add a dated photo
							</button>
						</div>
					</Show>
				}
			>
				<div class="timeline">
					<For each={groups().months}>
						{(group) => (
							<section class="tl-month">
								<h3 class="tl-month-label">
									<span>{group.label}</span>
								</h3>
								<For each={group.photos}>
									{(photo, index) => (
										<article
											class={[
												"tl-item",
												{
													right:
														(alternation().get(photo.id) ?? index()) % 2 === 1,
												},
											]}
										>
											<div class="tl-photo-wrap">
												<button
													type="button"
													class="tl-photo"
													onClick={() => props.onOpen(photo, group.photos)}
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
														loading="lazy"
														decoding="async"
													/>
													{/* The date and the caption belong to this photo and
													    to nothing else, so they sit on it rather than in
													    a column beside it. */}
													<span class="tl-plate">
														<span class="tl-meta">
															<span class="tl-date">
																{formatDay(photo.takenAt)}
															</span>
															<Show when={photo.place}>
																<span class="tl-place">
																	<Icon name="pin" size={12} />
																	{photo.place}
																</span>
															</Show>
														</span>
														<Show when={photo.caption}>
															<span class="tl-caption">{photo.caption}</span>
														</Show>
													</span>
												</button>
											</div>
											<span class="tl-dot" aria-hidden="true" />
										</article>
									)}
								</For>
							</section>
						)}
					</For>

					<Show when={groups().undated.length > 0}>
						<section class="tl-month">
							<h3 class="tl-month-label">
								<span>Before the dates</span>
							</h3>
							<p class="tl-undated-note">
								The first roll, and anything else still waiting for a date.
							</p>
							<div class="tl-undated">
								<For each={groups().undated}>
									{(photo) => (
										<button
											type="button"
											onClick={() => props.onOpen(photo, groups().undated)}
											aria-label={
												photo.caption
													? `Open ${photo.caption}`
													: "Open this photo"
											}
										>
											<img
												src={photo.thumbUrl}
												alt={photo.caption || "A memory of us"}
												loading="lazy"
												decoding="async"
											/>
											<Show when={photo.caption}>
												<span>{photo.caption}</span>
											</Show>
										</button>
									)}
								</For>
							</div>
						</section>
					</Show>
				</div>
			</Show>
		</>
	);
}
