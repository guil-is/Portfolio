import { client } from "./client";
import { person } from "./person";
import { project } from "./project";
import { siteSettings } from "./siteSettings";
import { signedAgreement } from "./signedAgreement";
import { proposalVisit } from "./proposalVisit";

export const schemaTypes = [
  client,
  person,
  project,
  siteSettings,
  signedAgreement,
  proposalVisit,
];
