import { Meta, Title } from "@solidjs/meta";
import { createSignal, For, onCleanup, Show } from "solid-js";
import { createMutableLocalStorage } from "../../invoicer/util";

type TimeEntry = {
	id: string;
	minutes: number;
	isRunning: boolean;
	startTime?: number;
	date: number; // timestamp
	description: string;
	location: string;
};

type TimeGroup = {
	id: string;
	name: string;
	entries: TimeEntry[];
};

function initState() {
	return createMutableLocalStorage("time-tracker", {
		groups: [] as TimeGroup[],
		nextGroupId: 1,
		nextEntryId: 1,
	});
}

function formatTime(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h ${mins}m`;
}

function formatTimeWithSeconds(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDate(timestamp: number): string {
	const date = new Date(timestamp);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	// Reset time part for comparison
	today.setHours(0, 0, 0, 0);
	yesterday.setHours(0, 0, 0, 0);
	const compareDate = new Date(date);
	compareDate.setHours(0, 0, 0, 0);

	if (compareDate.getTime() === today.getTime()) {
		return "Today";
	}
	if (compareDate.getTime() === yesterday.getTime()) {
		return "Yesterday";
	}

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
	});
}

export default function TimeTracker() {
	const state = initState();
	const [newGroupName, setNewGroupName] = createSignal("");
	const [editingGroupId, setEditingGroupId] = createSignal<string | null>(null);
	const [editingGroupName, setEditingGroupName] = createSignal("");
	const [manualTimes, setManualTimes] = createSignal<Record<string, string>>(
		{},
	);
	const [editingEntryId, setEditingEntryId] = createSignal<string | null>(null);
	const [currentTime, setCurrentTime] = createSignal(Date.now());

	// Update running timers every second
	const interval = setInterval(() => {
		setCurrentTime(Date.now());
	}, 1000);

	onCleanup(() => clearInterval(interval));

	const createGroup = () => {
		const name = newGroupName().trim();
		if (!name) return;

		state.groups.push({
			id: `group-${state.nextGroupId++}`,
			name,
			entries: [],
		});
		setNewGroupName("");
	};

	const deleteGroup = (groupId: string) => {
		const index = state.groups.findIndex((g) => g.id === groupId);
		if (index !== -1) {
			state.groups.splice(index, 1);
		}
	};

	const startEditingGroup = (group: TimeGroup) => {
		setEditingGroupId(group.id);
		setEditingGroupName(group.name);
	};

	const saveGroupName = () => {
		const groupId = editingGroupId();
		if (!groupId) return;

		const group = state.groups.find((g) => g.id === groupId);
		if (group) {
			group.name = editingGroupName().trim() || group.name;
		}
		setEditingGroupId(null);
	};

	const cancelEditingGroup = () => {
		setEditingGroupId(null);
	};

	const startTimer = (groupId: string) => {
		const group = state.groups.find((g) => g.id === groupId);
		if (!group) return;

		// Stop any other running timers in this group
		for (const entry of group.entries) {
			if (entry.isRunning) {
				stopTimer(groupId, entry.id);
			}
		}

		const entry: TimeEntry = {
			id: `entry-${state.nextEntryId++}`,
			minutes: 0,
			isRunning: true,
			startTime: Date.now(),
			date: Date.now(),
			description: "",
			location: "",
		};
		group.entries.push(entry);
	};

	const stopTimer = (groupId: string, entryId: string) => {
		const group = state.groups.find((g) => g.id === groupId);
		if (!group) return;

		const entry = group.entries.find((e) => e.id === entryId);
		if (!entry) return;

		if (entry.isRunning && entry.startTime) {
			entry.minutes = Math.ceil((Date.now() - entry.startTime) / 1000 / 60);
			entry.isRunning = false;
			delete entry.startTime;
		}
	};

	const deleteEntry = (groupId: string, entryId: string) => {
		const group = state.groups.find((g) => g.id === groupId);
		if (!group) return;

		const index = group.entries.findIndex((e) => e.id === entryId);
		if (index !== -1) {
			group.entries.splice(index, 1);
		}
	};

	const addManualTime = (groupId: string) => {
		const timeStr = manualTimes()[groupId] || "";
		const minutes = parseTimeInput(timeStr);

		if (minutes <= 0) return;

		const group = state.groups.find((g) => g.id === groupId);
		if (!group) return;

		group.entries.push({
			id: `entry-${state.nextEntryId++}`,
			minutes,
			isRunning: false,
			date: Date.now(),
			description: "",
			location: "",
		});

		setManualTimes({ ...manualTimes(), [groupId]: "" });
	};

	const parseTimeInput = (input: string): number => {
		const trimmed = input.trim().toLowerCase();
		if (!trimmed) return 0;

		// Try parsing as plain number (minutes)
		const plainNumber = Number(trimmed);
		if (!Number.isNaN(plainNumber)) {
			return Math.max(0, Math.ceil(plainNumber));
		}

		// Parse formats like "1h 30m", "1h", "30m", "1.5h"
		let totalMinutes = 0;

		// Match hours
		const hoursMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*h/);
		if (hoursMatch) {
			totalMinutes += Number.parseFloat(hoursMatch[1]) * 60;
		}

		// Match minutes
		const minutesMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*m/);
		if (minutesMatch) {
			totalMinutes += Number.parseFloat(minutesMatch[1]);
		}

		return Math.max(0, Math.ceil(totalMinutes));
	};

	const getTotalTime = (group: TimeGroup): number => {
		return group.entries.reduce((sum, entry) => {
			if (entry.isRunning && entry.startTime) {
				return sum + Math.ceil((Date.now() - entry.startTime) / 1000 / 60);
			}
			return sum + entry.minutes;
		}, 0);
	};

	return (
		<>
			<Title>Time Tracker</Title>
			<Meta name="robots" content="noindex" />

			<div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
				<div class="max-w-4xl mx-auto px-6 py-12">
					<div class="space-y-8">
						<div>
							<h1 class="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								Time Tracker
							</h1>
							<p class="text-gray-600 dark:text-gray-400">
								Track your time with groups and timers
							</p>
						</div>

						{/* Create new group */}
						<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
							<h2 class="text-xl font-bold mb-4">Create New Group</h2>
							<div class="flex gap-3">
								<input
									type="text"
									value={newGroupName()}
									onInput={(e) => setNewGroupName(e.currentTarget.value)}
									onKeyPress={(e) => {
										if (e.key === "Enter") createGroup();
									}}
									placeholder="Enter group name..."
									class="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<button
									type="button"
									onClick={createGroup}
									class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
								>
									Create
								</button>
							</div>
						</div>

						{/* Groups */}
						<div class="space-y-6">
							<For each={state.groups}>
								{(group) => (
									<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
										{/* Group header */}
										<div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-750 p-6 border-b border-gray-200 dark:border-gray-600">
											<div class="flex items-center justify-between mb-4">
												<Show
													when={editingGroupId() === group.id}
													fallback={
														<h2 class="text-2xl font-bold text-gray-800 dark:text-gray-100">
															{group.name}
														</h2>
													}
												>
													<input
														type="text"
														value={editingGroupName()}
														onInput={(e) =>
															setEditingGroupName(e.currentTarget.value)
														}
														onKeyPress={(e) => {
															if (e.key === "Enter") saveGroupName();
															if (e.key === "Escape") cancelEditingGroup();
														}}
														class="text-2xl font-bold px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
														autofocus
													/>
												</Show>
												<div class="flex gap-2">
													<Show
														when={editingGroupId() === group.id}
														fallback={
															<>
																<button
																	type="button"
																	onClick={() => startEditingGroup(group)}
																	class="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors font-medium"
																>
																	Edit
																</button>
																<button
																	type="button"
																	onClick={() => deleteGroup(group.id)}
																	class="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors font-medium"
																>
																	Delete
																</button>
															</>
														}
													>
														<button
															type="button"
															onClick={saveGroupName}
															class="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors font-medium"
														>
															Save
														</button>
														<button
															type="button"
															onClick={cancelEditingGroup}
															class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
														>
															Cancel
														</button>
													</Show>
												</div>
											</div>
											<div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
												{formatTime(getTotalTime(group))}
											</div>
										</div>

										{/* Group content */}
										<div class="p-6 space-y-4">
											{/* Timer controls */}
											<div class="flex gap-3">
												<Show
													when={!group.entries.some((e) => e.isRunning)}
													fallback={
														<button
															type="button"
															onClick={() => {
																const running = group.entries.find(
																	(e) => e.isRunning,
																);
																if (running) stopTimer(group.id, running.id);
															}}
															class="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md"
														>
															⏹ Stop Timer
														</button>
													}
												>
													<button
														type="button"
														onClick={() => startTimer(group.id)}
														class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md"
													>
														▶ Start Timer
													</button>
												</Show>
											</div>

											{/* Manual time entry */}
											<div class="flex gap-3">
												<input
													type="text"
													value={manualTimes()[group.id] || ""}
													onInput={(e) =>
														setManualTimes({
															...manualTimes(),
															[group.id]: e.currentTarget.value,
														})
													}
													onKeyPress={(e) => {
														if (e.key === "Enter") addManualTime(group.id);
													}}
													placeholder="Add time (e.g., 30, 1h 30m, 1.5h)"
													class="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
												<button
													type="button"
													onClick={() => addManualTime(group.id)}
													class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
												>
													Add
												</button>
											</div>

											{/* Time entries */}
											<Show when={group.entries.length > 0}>
												<div class="space-y-3 mt-6">
													<h3 class="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
														Time Entries
													</h3>
													<For each={group.entries}>
														{(entry) => {
															const isEditing = () =>
																editingEntryId() === entry.id;
															const elapsedSeconds = () =>
																entry.isRunning && entry.startTime
																	? Math.floor(
																			(currentTime() - entry.startTime) / 1000,
																		)
																	: entry.minutes * 60;

															return (
																<Show
																	when={isEditing()}
																	fallback={
																		<div class="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
																			<div class="flex items-start justify-between gap-4">
																				<div class="flex-1 space-y-2">
																					<div class="flex items-center gap-3">
																						<Show when={entry.isRunning}>
																							<div class="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
																						</Show>
																						<span class="text-xl font-bold text-blue-600 dark:text-blue-400">
																							{entry.isRunning
																								? formatTimeWithSeconds(
																										elapsedSeconds(),
																									)
																								: formatTime(entry.minutes)}
																						</span>
																						<Show when={!entry.isRunning}>
																							<span class="text-sm text-gray-500 dark:text-gray-400">
																								{formatDate(entry.date)}
																							</span>
																						</Show>
																					</div>
																					<Show when={entry.description}>
																						<p class="text-sm text-gray-700 dark:text-gray-300">
																							{entry.description}
																						</p>
																					</Show>
																					<Show when={entry.location}>
																						<p class="text-xs text-gray-500 dark:text-gray-400">
																							📍 {entry.location}
																						</p>
																					</Show>
																				</div>
																				<Show when={!entry.isRunning}>
																					<div class="flex gap-2">
																						<button
																							type="button"
																							onClick={() =>
																								setEditingEntryId(entry.id)
																							}
																							class="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
																						>
																							Edit
																						</button>
																						<button
																							type="button"
																							onClick={() =>
																								deleteEntry(group.id, entry.id)
																							}
																							class="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
																						>
																							Delete
																						</button>
																					</div>
																				</Show>
																			</div>
																		</div>
																	}
																>
																	<div class="p-4 bg-blue-50 dark:bg-gray-700 rounded-lg border-2 border-blue-300 dark:border-blue-600 space-y-3">
																		<div class="grid grid-cols-2 gap-3">
																			<div>
																				<label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
																					Time (e.g., 30, 1h 30m, 1.5h)
																				</label>
																				<input
																					type="text"
																					value={formatTime(entry.minutes)}
																					onInput={(e) => {
																						const minutes = parseTimeInput(
																							e.currentTarget.value,
																						);
																						if (minutes > 0)
																							entry.minutes = minutes;
																					}}
																					class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
																				/>
																			</div>
																			<div>
																				<label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
																					Date
																				</label>
																				<input
																					type="date"
																					value={
																						new Date(entry.date)
																							.toISOString()
																							.split("T")[0]
																					}
																					onInput={(e) => {
																						const date = new Date(
																							e.currentTarget.value,
																						);
																						if (!Number.isNaN(date.getTime())) {
																							entry.date = date.getTime();
																						}
																					}}
																					class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
																				/>
																			</div>
																		</div>
																		<div>
																			<label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
																				Description
																			</label>
																			<input
																				type="text"
																				value={entry.description}
																				onInput={(e) =>
																					(entry.description =
																						e.currentTarget.value)
																				}
																				placeholder="What did you work on?"
																				class="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
																			/>
																		</div>
																		<div>
																			<label class="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
																				Location
																			</label>
																			<div class="flex gap-2">
																				<input
																					type="text"
																					list={`location-options-${entry.id}`}
																					value={entry.location}
																					onInput={(e) =>
																						(entry.location =
																							e.currentTarget.value)
																					}
																					placeholder="Where did you work?"
																					class="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
																				/>
																				<datalist
																					id={`location-options-${entry.id}`}
																				>
																					<option value="Home" />
																					<option value="City" />
																				</datalist>
																			</div>
																		</div>
																		<div class="flex gap-2 justify-end">
																			<button
																				type="button"
																				onClick={() => setEditingEntryId(null)}
																				class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
																			>
																				Done
																			</button>
																			<button
																				type="button"
																				onClick={() => {
																					setEditingEntryId(null);
																					deleteEntry(group.id, entry.id);
																				}}
																				class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-medium"
																			>
																				Delete
																			</button>
																		</div>
																	</div>
																</Show>
															);
														}}
													</For>
												</div>
											</Show>
										</div>
									</div>
								)}
							</For>
						</div>

						<Show when={state.groups.length === 0}>
							<div class="text-center py-16">
								<p class="text-xl text-gray-500 dark:text-gray-400">
									No groups yet. Create one to get started!
								</p>
							</div>
						</Show>
					</div>
				</div>
			</div>
		</>
	);
}
