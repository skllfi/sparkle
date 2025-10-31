/* global document$, posthog */

document$.subscribe(() => {
  posthog.capture("$pageview");
});
