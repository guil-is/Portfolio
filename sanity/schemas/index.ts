import { client } from "./client";
import { project } from "./project";
import { siteSettings } from "./siteSettings";
import { signedAgreement } from "./signedAgreement";
import { proposalVisit } from "./proposalVisit";

export const schemaTypes = [
  client,
  project,
  siteSettings,
  signedAgreement,
  proposalVisit,
];
