import { Meta, Title } from "@solidjs/meta";
import { createEffect, createSignal, For, onMount, Show } from "solid-js";
import { Layout } from "./index";

type GoalArea = "personal" | "work";
type GoalStatus = "Not started" | "In progress" | "Paused" | "Done";

interface Goal {
	id: string;
	area: GoalArea;
	title: string;
	description: string;
	timeframe: string;
	status: GoalStatus;
	milestones: string[];
}

const storageKey = "oscartbeaumont:goals";

const defaultGoals: Goal[] = [
	{
		id: "personal-health",
		area: "personal",
		title: "Protect health and energy",
		description:
			"Build a sustainable routine that keeps long-term work possible without burning out.",
		timeframe: "Ongoing",
		status: "In progress",
		milestones: [
			"Keep a consistent sleep window",
			"Exercise most weeks",
			"Schedule proper downtime before it becomes urgent",
		],
	},
	{
		id: "personal-life",
		area: "personal",
		title: "Create a life outside the keyboard",
		description:
			"Make room for relationships, travel, hobbies, and memories that are not tied to shipping software.",
		timeframe: "Long term",
		status: "In progress",
		milestones: [
			"Plan regular time with people I care about",
			"Take trips that do not revolve around work",
			"Keep at least one offline hobby active",
		],
	},
	{
		id: "work-craft",
		area: "work",
		title: "Become undeniable at product engineering",
		description:
			"Get better at choosing the right problems, designing sharp solutions, and finishing the details that make products feel excellent.",
		timeframe: "Long term",
		status: "In progress",
		milestones: [
			"Ship fewer half-finished ideas",
			"Write clearer technical plans before big work",
			"Improve taste for product polish and UX details",
		],
	},
	{
		id: "work-business",
		area: "work",
		title: "Build durable independent income",
		description:
			"Grow projects into reliable businesses that can survive beyond short bursts of motivation.",
		timeframe: "5+ years",
		status: "Not started",
		milestones: [
			"Pick one primary project at a time",
			"Define a repeatable distribution channel",
			"Reach meaningful recurring revenue",
		],
	},
];

const emptyGoal: Goal = {
	id: "",
	area: "personal",
	title: "",
	description: "",
	timeframe: "",
	status: "Not started",
	milestones: [""],
};

export default function Goals() {
	const [goals, setGoals] = createSignal<Goal[]>(defaultGoals);
	const [draft, setDraft] = createSignal<Goal>({ ...emptyGoal });
	const [hydrated, setHydrated] = createSignal(false);

	onMount(() => {
		const saved = window.localStorage.getItem(storageKey);

		if (saved) {
			try {
				setGoals(JSON.parse(saved));
			} catch {
				window.localStorage.removeItem(storageKey);
			}
		}

		setHydrated(true);
	});

	createEffect(() => {
		if (!hydrated()) return;
		window.localStorage.setItem(storageKey, JSON.stringify(goals()));
	});

	const goalsFor = (area: GoalArea) => goals().filter((goal) => goal.area === area);

	const addGoal = () => {
		const next = {
			...draft(),
			id: crypto.randomUUID(),
			milestones: draft().milestones.filter((milestone) => milestone.trim()),
		};

		if (!next.title.trim()) return;

		setGoals((current) => [next, ...current]);
		setDraft({ ...emptyGoal, area: draft().area });
	};

	const removeGoal = (id: string) => {
		setGoals((current) => current.filter((goal) => goal.id !== id));
	};

	const updateStatus = (id: string, status: GoalStatus) => {
		setGoals((current) =>
			current.map((goal) => (goal.id === id ? { ...goal, status } : goal)),
		);
	};

	const updateMilestone = (index: number, value: string) => {
		setDraft((current) => ({
			...current,
			milestones: current.milestones.map((milestone, milestoneIndex) =>
				milestoneIndex === index ? value : milestone,
			),
		}));
	};

	return (
		<Layout>
			<Title>Goals | Oscar Beaumont</Title>
			<Meta name="robots" content="noindex,nofollow" />
			<Meta
				name="description"
				content="Private personal and work goals tracker."
			/>

			<header class="mb-10">
				<a
					href="/"
					class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 mb-5 text-sm font-medium"
				>
					<span>←</span>
					<span>Back to Home</span>
				</a>

				<div class="rounded-3xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 sm:p-8 shadow-sm">
					<p class="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500 mb-4">
						Private tracker
					</p>
					<h1 class="text-5xl md:text-6xl font-bold mb-4 tracking-tight text-gray-900 dark:text-gray-100">
						Goals
					</h1>
					<p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
						A quiet place to keep long-term personal and work direction visible.
						This page is hidden from search engines and stores edits only in this
						browser.
					</p>
				</div>
			</header>

			<section class="grid gap-5 md:grid-cols-2 mb-10">
				<GoalColumn title="Personal" goals={goalsFor("personal")} onRemove={removeGoal} onStatus={updateStatus} />
				<GoalColumn title="Work" goals={goalsFor("work")} onRemove={removeGoal} onStatus={updateStatus} />
			</section>

			<section class="pb-10">
				<div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 sm:p-6">
					<h2 class="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-5">
						Add goal
					</h2>

					<div class="grid gap-4">
						<div class="grid gap-4 sm:grid-cols-3">
							<label class="grid gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
								Area
								<select
									value={draft().area}
									onInput={(event) =>
										setDraft((current) => ({
											...current,
											area: event.currentTarget.value as GoalArea,
										}))
									}
									class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100"
								>
									<option value="personal">Personal</option>
									<option value="work">Work</option>
								</select>
							</label>

							<label class="grid gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
								Status
								<select
									value={draft().status}
									onInput={(event) =>
										setDraft((current) => ({
											...current,
											status: event.currentTarget.value as GoalStatus,
										}))
									}
									class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100"
								>
									<option>Not started</option>
									<option>In progress</option>
									<option>Paused</option>
									<option>Done</option>
								</select>
							</label>

							<label class="grid gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
								Timeframe
								<input
									value={draft().timeframe}
									onInput={(event) =>
										setDraft((current) => ({
											...current,
											timeframe: event.currentTarget.value,
										}))
									}
									placeholder="Long term"
									class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
								/>
							</label>
						</div>

						<label class="grid gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
							Title
							<input
								value={draft().title}
								onInput={(event) =>
									setDraft((current) => ({
										...current,
										title: event.currentTarget.value,
									}))
								}
								placeholder="What are you aiming for?"
								class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
							/>
						</label>

						<label class="grid gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
							Why it matters
							<textarea
								value={draft().description}
								onInput={(event) =>
									setDraft((current) => ({
										...current,
										description: event.currentTarget.value,
									}))
								}
								placeholder="A short reason this goal deserves attention."
								rows={3}
								class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
							/>
						</label>

						<div class="grid gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
							Milestones
							<For each={draft().milestones}>
								{(milestone, index) => (
									<input
										value={milestone}
										onInput={(event) =>
											updateMilestone(index(), event.currentTarget.value)
										}
										placeholder="Checkpoint"
										class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
									/>
								)}
							</For>
							<button
								type="button"
								onClick={() =>
									setDraft((current) => ({
										...current,
										milestones: [...current.milestones, ""],
									}))
								}
								class="justify-self-start text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
							>
								+ Add milestone
							</button>
						</div>

						<button
							type="button"
							onClick={addGoal}
							class="rounded-lg bg-gray-900 dark:bg-gray-100 px-4 py-2.5 text-sm font-semibold text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
						>
							Save goal
						</button>
					</div>
				</div>
			</section>
		</Layout>
	);
}

function GoalColumn(props: {
	title: string;
	goals: Goal[];
	onRemove: (id: string) => void;
	onStatus: (id: string, status: GoalStatus) => void;
}) {
	return (
		<div class="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sm:p-5">
			<div class="flex items-end justify-between gap-4 mb-5">
				<h2 class="text-sm font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
					{props.title}
				</h2>
				<span class="text-xs font-medium text-gray-400 dark:text-gray-500">
					{props.goals.length} goals
				</span>
			</div>

			<div class="space-y-4">
				<For each={props.goals}>
					{(goal) => (
						<article class="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 transition-shadow duration-200 hover:shadow-md dark:hover:shadow-gray-950/30">
							<div class="flex items-start justify-between gap-3 mb-3">
								<div>
									<p class="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
										{goal.timeframe || "No timeframe"}
									</p>
									<h3 class="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
										{goal.title}
									</h3>
								</div>

								<button
									type="button"
									onClick={() => props.onRemove(goal.id)}
									class="text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
								>
									Remove
								</button>
							</div>

							<p class="text-sm leading-relaxed text-gray-600 dark:text-gray-400 mb-4">
								{goal.description}
							</p>

							<select
								value={goal.status}
								onInput={(event) =>
									props.onStatus(goal.id, event.currentTarget.value as GoalStatus)
								}
								class="mb-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300"
							>
								<option>Not started</option>
								<option>In progress</option>
								<option>Paused</option>
								<option>Done</option>
							</select>

							<Show when={goal.milestones.length > 0}>
								<ul class="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
									<For each={goal.milestones}>
										{(milestone) => (
											<li class="flex gap-2 text-sm text-gray-600 dark:text-gray-400">
												<span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400 dark:bg-gray-500" />
												<span>{milestone}</span>
											</li>
										)}
									</For>
								</ul>
							</Show>
						</article>
					)}
				</For>
			</div>
		</div>
	);
}
