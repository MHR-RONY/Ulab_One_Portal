import { useState, useEffect, useRef } from "react";
import { loadingStore } from "@/lib/loadingStore";

type Phase = "idle" | "loading" | "finishing";

const GlobalLoader = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [phase, setPhase] = useState<Phase>("idle");
	const [opacity, setOpacity] = useState(1);

	const phaseRef = useRef<Phase>("idle");
	const rafRef = useRef<number>(0);
	const startTimeRef = useRef<number>(0);
	const finishTimerRef = useRef<ReturnType<typeof setTimeout>>();
	const opacityTimerRef = useRef<ReturnType<typeof setTimeout>>();

	const setPhaseSync = (p: Phase) => {
		phaseRef.current = p;
		setPhase(p);
	};

	useEffect(() => {
		loadingStore.subscribe(setIsLoading);
		return () => loadingStore.unsubscribe();
	}, []);

	useEffect(() => {
		if (isLoading) {
			clearTimeout(finishTimerRef.current);
			clearTimeout(opacityTimerRef.current);
			cancelAnimationFrame(rafRef.current);

			setPhaseSync("loading");
			setProgress(0);
			setOpacity(1);
			startTimeRef.current = performance.now();

			const tick = (now: number) => {
				const elapsed = now - startTimeRef.current;
				// Exponential ease-out: approaches 82% asymptotically
				const p = 82 * (1 - Math.exp(-elapsed / 1600));
				setProgress(p);
				if (p < 81.5) {
					rafRef.current = requestAnimationFrame(tick);
				}
			};
			rafRef.current = requestAnimationFrame(tick);
		} else {
			cancelAnimationFrame(rafRef.current);
			if (phaseRef.current === "loading") {
				setPhaseSync("finishing");
				setProgress(100);

				// Fade out after bar reaches 100%
				opacityTimerRef.current = setTimeout(() => setOpacity(0), 200);

				// Unmount after fade
				finishTimerRef.current = setTimeout(() => {
					setPhaseSync("idle");
					setProgress(0);
					setOpacity(1);
				}, 600);
			}
		}

		return () => {
			cancelAnimationFrame(rafRef.current);
			clearTimeout(finishTimerRef.current);
			clearTimeout(opacityTimerRef.current);
		};
	}, [isLoading]);

	if (phase === "idle") return null;

	const barTransition =
		phase === "finishing"
			? "width 0.22s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease"
			: "none";

	return (
		<>
			{/* ── Top progress bar ── */}
			<div
				className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
				style={{ opacity, transition: "opacity 0.35s ease" }}
			>
				<div className="relative h-[3px] w-full">
					{/* Track (very faint) */}
					<div className="absolute inset-0 bg-primary/8" />

					{/* Filled bar */}
					<div
						className="absolute top-0 left-0 h-full rounded-r-full overflow-hidden"
						style={{
							width: `${progress}%`,
							background:
								"linear-gradient(90deg, hsl(217,91%,55%) 0%, hsl(250,80%,65%) 55%, hsl(200,90%,62%) 100%)",
							boxShadow:
								"0 0 10px 1px hsl(217,91%,65%), 0 0 22px 3px hsl(217,91%,60%/0.35)",
							transition: barTransition,
						}}
					>
						{/* Moving shimmer sweep */}
						<div
							className="absolute inset-0 animate-loader-shimmer"
							style={{
								background:
									"linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.55) 50%, transparent 80%)",
								backgroundSize: "200% 100%",
							}}
						/>
					</div>

					{/* Glowing tip dot */}
					{phase === "loading" && (
						<div
							className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
							style={{
								left: `calc(${progress}% - 6px)`,
								background: "hsl(217,91%,70%)",
								boxShadow:
									"0 0 8px 3px hsl(217,91%,65%), 0 0 16px 6px hsl(250,80%,65%/0.5)",
								transition: "left 0.1s linear",
							}}
						/>
					)}
				</div>
			</div>

		</>
	);
};

export default GlobalLoader;
