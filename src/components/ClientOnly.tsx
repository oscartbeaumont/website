import { createSignal, onMount, Show, type ParentProps } from "solid-js";

function useIsClient() {
	const [isClient, setIsClient] = createSignal(false);
	onMount(() => setIsClient(true));
	return isClient;
}

export function ClientOnly(props: ParentProps) {
	const isClient = useIsClient();
	return <Show when={isClient()}>{props.children}</Show>;
}
