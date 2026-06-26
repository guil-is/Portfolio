# Adding a portfolio project

Projects (the homepage **Past work** grid and the `/projects/<slug>` case-study
pages) are managed in **Sanity Studio**, not in code. The `project` document
type holds every field, including images and video.

> The local file `src/content/projects.ts` is **legacy**. It still provides
> images and rich-text bodies for older projects that predate the CMS. Do not
> add new projects there. New projects live entirely in Sanity.

## How to add one

1. Open the Studio at **guil.is/studio** and log in.
2. Create a new **Project / Case Study** document.
3. Fill the fields (see the reference below). At minimum a project needs a
   **name**, **slug**, **client**, **summary**, and a **grid thumbnail** (the
   grid hides any project without one).
4. Set **Sort Order** to a low number to place it near the top of the grid
   (lower appears first, default is 100).
5. Publish. The homepage and the detail page update within ~60s (the routes
   revalidate on an interval).

A project appears on the homepage grid automatically once it is published with
a grid image and `isActiveProject` is off. The detail page lives at
`/projects/<slug>`.

## Field reference

| Field | Notes |
| --- | --- |
| **Project Name** | Headline. Shown in the grid and as the page title. |
| **URL Slug** | Auto-generates from the name. This is the `/projects/<slug>` URL. |
| **Client Name** | Shown under the name in the grid and in the meta row. |
| **Services Rendered** | Comma-separated. Rendered as tag pills (e.g. `Editing, Color, Sound Design`). |
| **Summary** | The big display quote near the top of the detail page. One or two sentences. |
| **Grid Thumbnail** | 16:9 image for the homepage grid. Required to show in the grid. |
| **Hero Image** | Optional larger hero for the detail page. Falls back to the grid image. |
| **Hero Video URL** | YouTube or Vimeo. When set, plays at the top of the detail page instead of the hero image. |
| **Live Website URL** | Optional "visit live" link. |
| **Year** | e.g. `2026`. |
| **Team** | Optional. Reference people or an organisation to show avatars in the meta row. |
| **Featured** | Optional flag. |
| **Project Article Body** | Rich text for the case-study body. Supports headings, images (with captions), and video embeds. |
| **Still Frames** | Optional gallery of stills. |
| **Sort Order** | Lower appears first. Default 100. |
| **Show in Recent / Active** | Off for finished work. On promotes it to the prominent section above Past work (uses the role + blurb fields). |

## Media tips

- **Grid thumbnail**: export a strong 16:9 still from the film.
- **Hero video**: the embed accepts YouTube or Vimeo only. If a film currently
  lives only on X or as a raw file, upload it to YouTube or Vimeo (unlisted is
  fine) and paste that URL.

---

## Ready to enter: latest two projects

Copy these into Studio. Anything in `[brackets]` is a media upload or link to
supply.

### 1. Hivemind (Myosin)

- **Project Name**: Hivemind
- **URL Slug**: `hivemind`
- **Client Name**: Myosin
- **Services Rendered**: Concept, Animation, Motion Design
- **Summary**: A 30-second animated launch film for Hivemind, Myosin's AI
  marketing strategist. Built to make its output impossible to ignore, cut for
  the Product Hunt launch and paid social on LinkedIn and X.
- **Year**: 2026
- **Hero Video URL**: `[YouTube/Vimeo URL of the 30s film]`
- **Grid Thumbnail**: `[16:9 still from the film]`
- **Live Website URL**: `[Myosin or Hivemind link, optional]`
- **Featured**: on
- **Sort Order**: 5
- **Show in Recent / Active**: off
- **Project Article Body** (suggested):
  > Hivemind is Myosin's AI marketing strategist. The brief was to turn a
  > text-heavy product demo into something paced and engaging, not a flat screen
  > recording, and to make it loop for the launch.
  >
  > The film pulls the sharpest lines of the conversation forward and holds them
  > on screen, sets Hivemind side by side against a generic chatbot on the same
  > prompt, and shows the human knowledge behind the answers. It closes on the
  > call to action: Hire Hivemind.
  >
  > [video embed of the film]
  >
  > Delivered in square and vertical cuts for LinkedIn, X, and web.

### 2. A World With AI (TEDxBerlin)

- **Project Name**: A World With AI
- **URL Slug**: `tedxberlin-a-world-with-ai`
- **Client Name**: TEDxBerlin
- **Services Rendered**: Editing, Color, Sound Design
- **Summary**: The Day 2 after-movie for TEDxBerlin's "A World With AI". A short
  recap cut from event footage and interviews, graded and sound-designed,
  delivered in Full HD.
- **Year**: 2026
- **Hero Video URL**: `[YouTube/Vimeo URL of the after-movie]`
- **Grid Thumbnail**: `[16:9 still from the after-movie]`
- **Live Website URL**: `[TEDxBerlin event page, optional]`
- **Featured**: on
- **Sort Order**: 10
- **Show in Recent / Active**: off
- **Project Article Body** (suggested):
  > A one to two minute after-movie for Day 2 of TEDxBerlin's "A World With AI".
  >
  > The cut combines footage from the event, including material from a
  > third-party videographer and interviews captured on site. The work covered
  > footage review and selection, editing, color grading, sound design and mix,
  > music, and titles.
  >
  > [video embed of the after-movie]
  >
  > Delivered as a Full HD master.
