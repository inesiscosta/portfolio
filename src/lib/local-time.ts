import { SITE } from "#lib/content/site.ts";

const clock = new Intl.DateTimeFormat("en-GB", { timeZone: SITE.timeZone, hour: "2-digit", minute: "2-digit" });

export const localTime = (date: Date) => clock.format(date);
