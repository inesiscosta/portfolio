import { contentUrl } from "#lib/content/about.ts";
import type { ResumeFile } from "#lib/content/schema.ts";
import { SITE } from "#lib/content/site.ts";
import pages from "/src/content/pages.yaml";
import resume from "/src/content/resume.yaml";

/*
  The resume page. The entries, skills, portrait and PDF live in the private content repo (src/content/resume.yaml);
  the portrait and PDF themselves are in the R2 bucket. This module adds the fixed copy and the types.
*/

/** The angles the resume can be tailored to, from resume.yaml. */
export const CV_FOCUSES = resume.focuses;
export type CvFocus = string;

/** One organisation; several roles there are listed under it, newest first. */
export type CvEntry = ResumeFile["experience"][number];
export type CvRole = CvEntry["roles"][number];
export type CvPoint = CvRole["points"][number];

/** Which focus areas a skill belongs to, so a tailored resume lists the relevant ones first. */
export const SKILL_FOCUS = resume.skillFocus;

export const CV = {
  name: SITE.fullName,
  title: SITE.role,
  location: SITE.location,
  email: SITE.email,
  website: SITE.url,
  /** Shown at 8.75rem wide; 320px covers 2x screens. */
  portrait: { src: contentUrl(resume.portrait.src, 320), alt: resume.portrait.alt },
  pdf: contentUrl(resume.pdf),
  /** The name a downloaded copy gets. */
  pdfName: resume.pdf.slice(resume.pdf.lastIndexOf("/") + 1),
  header: {
    eyebrow: "Resume",
    title: pages.resume.heading,
    body: pages.resume.intro,
  },
  experience: resume.experience,
  education: resume.education,
  skills: resume.skills,
  volunteering: resume.volunteering,
};
