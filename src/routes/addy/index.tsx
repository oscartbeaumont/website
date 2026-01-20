import {
	createDate,
	createTimeAgo,
	getCountdown,
} from "@solid-primitives/date";
import { createMemo, For } from "solid-js";
import { Title, Meta } from "@solidjs/meta";
import "@fontsource/lora";

const files = [
	"IMG_5752.png",
	"IMG_6406.png",
	"IMG_6849.png",
	"IMG_7050.png",
	"IMG_7295.png",
	"IMG_7579.png",
	"IMG_6367.png",
	"IMG_7309.png",
	"IMG_5946.png",
];

export default function Page() {
	const [startDate] = createDate("Jun 20, 2025");
	const [, { difference }] = createTimeAgo(startDate);
	const diff = createMemo(() => getCountdown(difference() * -1));

	return (
		<div class="font-['Lora'] text-black min-h-screen w-full bg-linear-to-br from-sky-50 via-blue-50 to-indigo-50 animate-gradient">
			<section class="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
				<Title>A really cute model</Title>
				<Meta name="robots" content="noindex" />

				<div class="text-center max-w-4xl mx-auto relative z-10">
					<h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance">
						Addy
					</h1>

					<p class="text-xl md:text-2xl text-primary font-semibold mb-3 animate-[fadeIn_0.3s_0s_both]">
						Together {diff().days} days since 20 June 2025 ❤️
					</p>

					<div class="animate-[fadeIn_0.3s_0.3s_both]">
						<p class="text-muted-foreground max-w-xl mx-auto leading-relaxed text-lg">
							Your the best! We have had some of the best times together!
						</p>

						<p class="text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed text-lg">
							I can't wait to see what comes next! 😘
						</p>
					</div>

					<div class="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  animate-[fadeIn_0.3s_0.5s_both]">
						<For each={files}>
							{(file) => (
								<img
									src={`/addy/imgs/${file}`}
									alt="Memory"
									class="rounded-lg shadow-lg w-full h-auto object-cover"
								/>
							)}
						</For>
					</div>
				</div>
			</section>
		</div>
	);
}
