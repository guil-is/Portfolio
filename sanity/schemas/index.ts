import { client } from "./client";
import { person } from "./person";
import { project } from "./project";
import { siteSettings } from "./siteSettings";
import { signedAgreement } from "./signedAgreement";
import { proposalVisit } from "./proposalVisit";
import { testimonial } from "./testimonial";
import { resource } from "./resource";
import { booksSync } from "./booksSync";

export const schemaTypes = [
  client,
  person,
  project,
  siteSettings,
  signedAgreement,
  proposalVisit,
  testimonial,
  resource,
  booksSync,
];
