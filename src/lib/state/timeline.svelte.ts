/* Lets the About photo stack move the timeline to a photo's event. Browser-only writes, see theme.svelte.ts. */
import type { TimelineId } from "#lib/content/timeline.ts";

export const timelineRequest = $state<{ id: TimelineId | null; seq: number }>({ id: null, seq: 0 });

export function showTimelineEvent(id: TimelineId) {
  timelineRequest.id = id;
  timelineRequest.seq += 1;
}
