import Briefcase from "@lucide/svelte/icons/briefcase";
import CodeXml from "@lucide/svelte/icons/code-xml";
import Coffee from "@lucide/svelte/icons/coffee";
import GraduationCap from "@lucide/svelte/icons/graduation-cap";
import Heart from "@lucide/svelte/icons/heart";
import Mail from "@lucide/svelte/icons/mail";
import Rocket from "@lucide/svelte/icons/rocket";
import Users from "@lucide/svelte/icons/users";
import type { Component } from "svelte";
import type { ContactIcon } from "#lib/content/shared.ts";
import pages from "/src/content/pages.yaml";

/* The home page's contact section. The copy is in the content repo's pages.yaml; this maps its icon names. */

const ICONS: Record<ContactIcon, Component> = {
  briefcase: Briefcase,
  "code-xml": CodeXml,
  coffee: Coffee,
  "graduation-cap": GraduationCap,
  heart: Heart,
  mail: Mail,
  rocket: Rocket,
  users: Users,
};

export const CONTACT = {
  eyebrow: "Contact",
  heading: pages.contact.heading,
  highlight: pages.contact.highlight,
  body: pages.contact.body,
  topics: pages.contact.topics.map(({ label, icon }) => ({ label, icon: ICONS[icon] })),
} as const;
