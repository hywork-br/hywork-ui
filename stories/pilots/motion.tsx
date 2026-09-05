import { Check, X } from "lucide-react";
import { AnimatePresence, motion, useAnimationControls, useIsPresent, usePresence } from "motion/react";
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import {
  Button,
  PopoverContent,
  type ActiveFilter,
  type FilterBarProps,
} from "../../src";
import "./motion.css";

// Experimental adapters only: never exported by @hywork/ui.
type PilotTiming = {
  enter: number;
  exit: number;
  ease: [number, number, number, number];
};
const MotionPolicy = createContext<PilotTiming & { instant: boolean }>({
  instant: true,
  enter: 0,
  exit: 0,
  ease: [0, 0, 1, 1],
});

export function PilotMotionScope({
  children,
  enabled,
}: {
  children: ReactNode;
  enabled: boolean;
}) {
  return enabled ? (
    <EnabledMotionScope>{children}</EnabledMotionScope>
  ) : (
    children
  );
}

function EnabledMotionScope({ children }: { children: ReactNode }) {
  const [reduced, setReduced] = useState(true);
  const [keyboard, setKeyboard] = useState(true);
  const [timing, setTiming] = useState<PilotTiming>({
    enter: 0,
    exit: 0,
    ease: [0, 0, 1, 1],
  });
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const syncPreference = () => {
      setReduced(media?.matches ?? false);
      // Refresh when full motion is restored, too: CSS tokens are media-aware.
      if (media?.matches) return;
      const css = getComputedStyle(document.documentElement);
      const seconds = (name: string) => {
        const raw = css.getPropertyValue(name).trim();
        return (parseFloat(raw) || 0) / (raw.endsWith("ms") ? 1000 : 1);
      };
      const curve = css
        .getPropertyValue("--hw-ease-standard")
        .match(/[\d.]+/g)
        ?.map(Number);
      if (curve?.length === 4) {
        setTiming({
          enter: seconds("--hw-duration-base"),
          exit: seconds("--hw-duration-fast"),
          ease: curve as PilotTiming["ease"],
        });
      }
    };
    syncPreference();
    media?.addEventListener("change", syncPreference);
    return () => media?.removeEventListener("change", syncPreference);
  }, []);
  const instant = keyboard || !!reduced;
  return (
    <MotionPolicy.Provider value={{ instant, ...timing }}>
      <div
        data-pilot-motion={instant ? "instant" : "full"}
        onKeyDownCapture={() => setKeyboard(true)}
        onPointerDownCapture={() => setKeyboard(false)}
      >
        {children}
      </div>
    </MotionPolicy.Provider>
  );
}

function usePilotTransition(exit = false) {
  const policy = useContext(MotionPolicy);
  return {
    instant: policy.instant,
    transition: {
      duration: policy.instant ? 0 : exit ? policy.exit : policy.enter,
      ease: policy.ease,
    },
  };
}

const MotionChip = forwardRef<HTMLSpanElement, { filter: ActiveFilter }>(
  function MotionChip({ filter }, ref) {
    const present = useIsPresent();
    const { instant, transition } = usePilotTransition(!present);
    return (
      <motion.span
        ref={ref}
        className="hw-filter-chip"
        layout={instant ? false : "position"}
        initial={instant ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
        inert={!present || undefined}
        aria-hidden={!present || undefined}
      >
        {filter.label}
        {filter.onRemove && (
          <button
            aria-label={`Remover ${filter.label}`}
            disabled={!present}
            onClick={filter.onRemove}
            type="button"
          >
            <X aria-hidden="true" />
          </button>
        )}
      </motion.span>
    );
  }
);

/** Same anatomy and CSS as FilterBar; opt-in adapter isolates the experiment. */
export function PilotMotionFilterBar({
  activeFilters = [],
  filters,
  onClearAll,
  search,
}: FilterBarProps) {
  const { transition } = usePilotTransition();
  const activeRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const element = activeRef.current;
    if (!element || !activeFilters.length) {
      setHeight(0);
      return;
    }
    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    observer?.observe(element);
    return () => observer?.disconnect();
  }, [activeFilters.length]);
  return (
    <section className="hw-filter-bar hw-motion-filters">
      <div className="hw-filter-bar__controls">
        <div className="hw-filter-bar__search">{search}</div>
        <div aria-label="Filtros" className="hw-filter-bar__filters">
          {filters}
        </div>
      </div>
      <motion.div
        className="hw-motion-filters__reveal"
        initial={false}
        animate={{ height }}
        transition={transition}
      >
        <div
          aria-label="Filtros ativos"
          className="hw-filter-bar__active"
          ref={activeRef}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {activeFilters.map((filter) => (
              <MotionChip filter={filter} key={filter.id} />
            ))}
          </AnimatePresence>
          {activeFilters.length > 0 && onClearAll && (
            <Button onClick={onClearAll} size="sm" variant="quiet">
              Limpar filtros
            </Button>
          )}
        </div>
      </motion.div>
    </section>
  );
}

export function PilotMotionPopoverContent(
  props: Pick<
    ComponentProps<typeof PopoverContent>,
    "align" | "className" | "aria-label" | "children"
  >
) {
  const { instant, transition } = usePilotTransition();
  return (
    <PopoverContent {...props} asChild>
      <motion.div
        className={`${props.className ?? ""} hw-motion-popover`}
        data-pilot-instant={instant || undefined}
        initial={instant ? false : { opacity: 0, transform: "scale(0.98)" }}
        animate={{ opacity: 1, transform: "scale(1)" }}
        transition={transition}
      >
        {props.children}
      </motion.div>
    </PopoverContent>
  );
}

export function PilotSaveNotice({
  notice,
  saved,
}: {
  notice: string;
  saved: boolean;
}) {
  const { instant, transition } = usePilotTransition();
  const controls = useAnimationControls();
  const noticeRef = useRef<HTMLSpanElement>(null);
  const previousNotice = useRef<string | null>(null);
  useLayoutEffect(() => {
    const changed = notice !== previousNotice.current;
    previousNotice.current = notice;
    controls.stop();
    if (instant || !saved || !changed) {
      controls.set({ opacity: 1 });
      if (noticeRef.current) noticeRef.current.style.opacity = "1";
    } else {
      controls.set({ opacity: 0 });
      void controls.start({ opacity: 1, transition });
    }
    return () => controls.stop();
  }, [controls, instant, notice, saved, transition.duration]);
  return (
    <p className="hw-reference-notice" role="status" aria-atomic="true">
      {notice && (
        <motion.span
          ref={noticeRef}
          className="hw-motion-notice"
          key={notice}
          initial={instant || !saved ? false : { opacity: 0 }}
          animate={controls}
          transition={transition}
        >
          {saved && <Check aria-hidden="true" />}
          {notice}
        </motion.span>
      )}
    </p>
  );
}

/** Bounded contextual actions. Exit content is inert from the first exit render.
 * Explicit stop/set is necessary: changing duration alone does not settle a
 * transition already running when the OS preference or input modality changes. */
export function PilotMotionPresence({ children, visible, label, className }: {
  children: ReactNode;
  visible: boolean;
  label: string;
  className?: string;
}) {
  return <AnimatePresence initial={false}>
    {visible && <PresenceRegion key="context" label={label} className={className}>{children}</PresenceRegion>}
  </AnimatePresence>;
}

function PresenceRegion({ children, label, className }: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  const [present, remove] = usePresence();
  const { instant, transition } = usePilotTransition(!present);
  const controls = useAnimationControls();
  const regionRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    let current = true;
    const target = present
      ? { opacity: 1, height: "auto", transform: "none" }
      : { opacity: 0, height: 0, transform: "translateY(calc(-1 * var(--hw-space-1)))" };
    controls.stop();
    if (instant) {
      controls.set(target);
      // Motion schedules DOM writes on its next frame. The accessibility path
      // must already be settled in this layout commit, including mid-flight.
      if (regionRef.current) Object.assign(regionRef.current.style, {
        opacity: String(target.opacity),
        height: present ? "auto" : "0px",
        transform: target.transform,
      });
      if (!present) remove?.();
    } else {
      void controls.start({ ...target, transition }).then(() => {
        if (current && !present) remove?.();
      });
    }
    return () => { current = false; controls.stop(); };
  }, [controls, instant, present, remove, transition.duration]);
  return <motion.div
    ref={regionRef}
    role="region"
    aria-label={label}
    aria-hidden={!present || undefined}
    inert={!present || undefined}
    className={className}
    data-pilot-presence={present ? "present" : "exiting"}
    initial={instant ? false : { opacity: 0, height: 0, transform: "translateY(calc(-1 * var(--hw-space-1)))" }}
    animate={controls}
  >{children}</motion.div>;
}
