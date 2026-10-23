import { Show } from "solid-js";
import { formatDay } from "../album";
import type { AddyPhoto } from "../store";
import { Icon } from "./Icons";

/**
 * The date, the place and the caption sit on the photo itself. In a column
 * beside it they looked like they could belong to either neighbour, and on a
 * wide screen they drifted a long way from the picture they described.
 */
export function PhotoPlate(props: { photo: AddyPhoto }) {
	return (
		<span class="photo-plate">
			<span class="photo-plate-meta">
				<Show when={props.photo.takenAt}>
					<span class="photo-plate-date">{formatDay(props.photo.takenAt)}</span>
				</Show>
				<Show when={props.photo.place}>
					<span class="photo-plate-place">
						<Icon name="pin" size={12} />
						{props.photo.place}
					</span>
				</Show>
			</span>
			<Show when={props.photo.caption}>
				<span class="photo-plate-caption">{props.photo.caption}</span>
			</Show>
		</span>
	);
}
