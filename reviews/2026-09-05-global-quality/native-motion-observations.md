# Native motion observations — 2026-09-05

Source: local Storybook `lab-interface-details--workspace`, commit `5cc5c13`,
native browser at 1440×1000. These are laboratory fixtures, not production.
Read-only DOM samples were collected with requestAnimationFrame through CDP Runtime;
the interaction itself used the native browser pointer API.

The sampling promise was started without awaiting it, followed by the real click,
then resolved with Runtime.awaitPromise. Times below are milliseconds from sampler
start, not claimed component animation durations; command/React scheduling is included.

## Bulk actions, full motion

| Entry time | Height px | Opacity |
| --- | --- | --- |
| 129 | 0 | 0 |
| 160 | 0.1 | 0.15625 |
| 193 | 8.7 | 0.652474 |
| 227 | 34.4 | 0.897065 |
| 260 | 46.7 | 0.984111 |
| 294 | 51.2 | 1 |
| 326 | 52 | 1 |

| Exit time | Height px | Opacity | Interaction state |
| --- | --- | --- | --- |
| 101 | 52 | 1 | Present, not inert |
| 153 | 52 | 1 | Exiting, inert, aria-hidden |
| 167 | 51.8 | 0.943213 | Exiting, inert, aria-hidden |
| 200 | 48.1 | 0.350627 | Exiting, inert, aria-hidden |
| 233 | 17.6 | 0.0637801 | Exiting, inert, aria-hidden |
| 266 | 3.2 | 0.000354607 | Exiting, inert, aria-hidden |
| 300 | 0 | 0 | Exiting, inert, aria-hidden |
| 333 | Absent | Absent | Removed |

After clearing the selection, focus returned to the named search field.
The exit retained its layout height initially and made outgoing controls inert
before collapse, rather than leaving operable disappearing actions.

## Reduced motion and limitations

With reduced motion enabled without reloading, the next entry was immediately
52px/opacity1/transform:none in its first present sample (129ms) and stayed there.
An earlier outgoing zero-height node was seen before the click; this sample did
not establish when that outgoing node was removed.

A separate dynamic preference-change sample reached instant mode with the final
styles, but the media change arrived after most of the entry animation. It does
**not** prove interruption of an intermediate rendered frame. The direct browser
harness must supply that evidence, alongside reduced exit and keyboard behavior.

These observations are not a claim that every Storybook play, accessibility gate,
visual comparison, browser engine, or product consumer has passed.

## Reduced exit fix confirmation — ceba670

Repeated settled DOM reads reproduced the retained exiting node under reduction
from the start, not just one deferred animation frame. The adapter was corrected
to retain immediate final styles in layout and signal removal in the effect
after AnimatePresence has registered its outgoing key; there is no timer.

The native browser repeated selection then clear at320×740 with reduced motion:
zero remaining bulk-presence nodes, focus Buscar conteúdos, document320px.
FullJourney with full motion then completed:7total,0selected, saved-view status,
closed preferences and focus on their trigger. Real in-flight media interruption
and native keyboard navigation after saving a view remain browser-harness gates.
