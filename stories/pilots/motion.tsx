import { Check, X } from "lucide-react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
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
  return (
    <p className="hw-reference-notice" role="status" aria-atomic="true">
      {notice && (
        <motion.span
          className="hw-motion-notice"
          key={notice}
          initial={instant || !saved ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transition}
        >
          {saved && <Check aria-hidden="true" />}
          {notice}
        </motion.span>
      )}
    </p>
  );
}
