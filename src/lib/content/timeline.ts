import Award from "@lucide/svelte/icons/award";
import Baby from "@lucide/svelte/icons/baby";
import Bird from "@lucide/svelte/icons/bird";
import CarFront from "@lucide/svelte/icons/car-front";
import CodeXml from "@lucide/svelte/icons/code-xml";
import Cpu from "@lucide/svelte/icons/cpu";
import Crown from "@lucide/svelte/icons/crown";
import Eclipse from "@lucide/svelte/icons/eclipse";
import Gamepad2 from "@lucide/svelte/icons/gamepad-2";
import GraduationCap from "@lucide/svelte/icons/graduation-cap";
import Heart from "@lucide/svelte/icons/heart";
import MapPin from "@lucide/svelte/icons/map-pin";
import MicVocal from "@lucide/svelte/icons/mic-vocal";
import Microscope from "@lucide/svelte/icons/microscope";
import MountainSnow from "@lucide/svelte/icons/mountain-snow";
import Pickaxe from "@lucide/svelte/icons/pickaxe";
import Plane from "@lucide/svelte/icons/plane";
import Presentation from "@lucide/svelte/icons/presentation";
import Route from "@lucide/svelte/icons/route";
import Sailboat from "@lucide/svelte/icons/sailboat";
import School from "@lucide/svelte/icons/school";
import Snowflake from "@lucide/svelte/icons/snowflake";
import Stamp from "@lucide/svelte/icons/stamp";
import TabletSmartphone from "@lucide/svelte/icons/tablet-smartphone";
import Ticket from "@lucide/svelte/icons/ticket";
import Users from "@lucide/svelte/icons/users";
import Wind from "@lucide/svelte/icons/wind";
import type { Component } from "svelte";
import type { TimelineIcon } from "#lib/content/shared.ts";
import { events } from "/src/content/timeline.yaml";

/*
  The About timeline. The events live in the private content repo (src/content/timeline.yaml); this module maps each
  event's icon name to its Lucide component. To use a new icon, add it to TIMELINE_ICONS in shared.ts and here.
*/

export type TimelineId = string;

const ICONS: Record<TimelineIcon, Component> = {
  award: Award,
  baby: Baby,
  bird: Bird,
  "car-front": CarFront,
  "code-xml": CodeXml,
  cpu: Cpu,
  crown: Crown,
  eclipse: Eclipse,
  "gamepad-2": Gamepad2,
  "graduation-cap": GraduationCap,
  heart: Heart,
  "map-pin": MapPin,
  "mic-vocal": MicVocal,
  microscope: Microscope,
  "mountain-snow": MountainSnow,
  pickaxe: Pickaxe,
  plane: Plane,
  presentation: Presentation,
  route: Route,
  sailboat: Sailboat,
  school: School,
  snowflake: Snowflake,
  stamp: Stamp,
  "tablet-smartphone": TabletSmartphone,
  ticket: Ticket,
  users: Users,
  wind: Wind,
};

type TimelineEvent = {
  id: TimelineId;
  date: string;
  heading: string;
  description: string;
  icon: Component;
};

export const TIMELINE: TimelineEvent[] = events.map((event) => ({ ...event, icon: ICONS[event.icon] }));
