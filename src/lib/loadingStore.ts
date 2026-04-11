type LoadingListener = (isLoading: boolean) => void;

let activeCount = 0;
let listener: LoadingListener | null = null;

export const loadingStore = {
	subscribe: (fn: LoadingListener) => {
		listener = fn;
	},
	unsubscribe: () => {
		listener = null;
	},
	increment: () => {
		activeCount++;
		if (activeCount === 1) listener?.(true);
	},
	decrement: () => {
		activeCount = Math.max(0, activeCount - 1);
		if (activeCount === 0) listener?.(false);
	},
};
