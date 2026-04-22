"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;

export default defineConfig({
  name: "guil-portfolio",
  title: "Guil Portfolio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            // Site Settings as a singleton
            S.listItem()
              .title("Site Settings")
              .id("siteSettings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings"),
              ),
            S.divider(),
            // Projects
            S.documentTypeListItem("project").title("Projects"),
            // Clients
            S.documentTypeListItem("client").title("Clients & Partners"),
            // People
            S.documentTypeListItem("person").title("People"),
            // Testimonials
            S.documentTypeListItem("testimonial").title("Testimonials"),
            S.divider(),
            // Signed agreement audit log
            S.documentTypeListItem("signedAgreement").title(
              "Signed Agreements",
            ),
            // Proposal visit log
            S.documentTypeListItem("proposalVisit").title("Proposal Visits"),
          ]),
    }),
    visionTool({ defaultApiVersion: "2024-01-01" }),
  ],
  schema: { types: schemaTypes },
});
