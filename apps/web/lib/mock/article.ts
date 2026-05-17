// lib/mock/article.ts
//
// Canonical mock payload. Mirrors `article-data.jsx` from the design handoff,
// strictly typed against `types/article.ts`. If this file fails to compile,
// the type contract is wrong — fix the contract, not the mock.
//
// Component developers can import this directly:
//   import { mockArticle } from "@/lib/mock/article";

import type { Article } from "@/types/article";

export const mockArticle: Article = {
  type: "node--article",
  id: "0e4a8b2a-1c5f-4d6f-9c0b-b1f8d22c4a31",
  attributes: {
    title:
      "Meridian Industrial Debuts Continental Logistics Program for Next-Generation Fleet Operators",
    summary:
      "The hundred-year industrial brand unveils a new continental program backing the operators, mechanics, and route engineers who keep modern freight moving.",
    dateline_location: "Cleveland, Oh.",
    published_at: "2026-04-16",
    read_minutes: 4,
    breadcrumb: [
      { label: "Home", href: "#", icon: "home" },
      { label: "Newsroom", href: "#" },
      {
        label:
          "Meridian Industrial Debuts Continental Logistics Program for Next-Generation Fleet Operators",
      },
    ],
    tags: [{ id: "partnerships", label: "Partnerships" }],
  },
  hero: {
    kind: "video",
    poster_alt: "Convoy of service trucks at dawn on a coastal highway",
    caption: null,
    duration_sec: 64,
  },
  body: [
    {
      kind: "rich_text",
      html:
        "<p><strong>CLEVELAND, Oh.</strong> — (April 16, 2026) Meridian Industrial Group, a century-old leader in fluids, lubricants, and aftermarket service<sup>1</sup>, announced today the launch of its Continental Logistics Program — a multi-region initiative designed to back the operators and mechanics keeping freight moving across North America.</p>" +
        "<p>Built around the people who do the work, the program highlights the route engineers, dispatch teams, and bay technicians whose decisions compound into thousands of on-time deliveries every day. The initiative covers not just the visible heroics of long-haul driving, but the quiet preparation and care that makes every mile possible.</p>" +
        "<p>Anchoring the program is a new field-service compact titled, <em>The Operator's Standard.</em> As a tribute to the discipline of the trade, the compact codifies Meridian's 100-year commitment to its customers and the routes they keep alive. Whether a fleet is running cold-chain across the Plains or last-mile through dense urban grids, Meridian shows up at the bay, on the line, and in the planning room.</p>",
    },
    {
      kind: "pull_quote",
      quote:
        "Being a hundred-year brand means we have always shown up at the bay. The freight network is the perfect place to celebrate that — every operator we back is a story about preparation, trust, and the next mile. This program champions the people who make the journey possible, and the ones who help them keep it.",
      author: {
        name: "Dana Okafor",
        title: "Chief Brand Officer",
        org: "Meridian Industrial Group",
        portrait_alt: "Portrait of Dana Okafor, Chief Brand Officer",
      },
    },
    {
      kind: "rich_text",
      html:
        "<p>Developed with continental creative partner North & Vale, <em>The Operator's Standard</em> rolls out first in the Midwest corridor, expanding through the summer into the Gulf, Pacific Northwest, and Atlantic regions. Each rollout captures the moments, preparation, emotion, and the unseen force that keeps fleets moving, depot after depot.</p>" +
        "<p>Running through October, the program will engage broadcast, trade-radio, depot-level signage, and an on-site experience tour to drive engagement and invite operators to share their own stories.</p>" +
        "<p>The initiative is further captured through Meridian's <em>Operator's Standard</em> field-rewards and depot giveaways in select regions, recognizing the grit of operators and mechanics alike. Rewards continue through August, offering teams a chance to earn certified training, equipment grants, and a featured spot in the program's documentary series.</p>" +
        "<p>As the season unfolds, so does Meridian's commitment to the operator's journey. To learn more about the continental program or the depot rewards, visit <a href=\"#\">the Meridian Operator's Hub</a>.</p>",
    },
  ],
  contact: {
    name: "Britt Sage",
    org: "Meridian Group Communications",
    email: "press@meridiangroup.example",
  },
  legal: [
    "Meridian™ is a registered trademark of Meridian Industrial Group or its subsidiaries. All other trademarks referred to in this article are the property of their respective holders.",
    "*Terms and conditions apply.",
    "¹References to “a century-old leader” reflect Meridian Industrial Group's heritage as one of North America's longest-operating fluids brands.",
  ],
  share: ["facebook", "x", "linkedin", "email", "print", "copy"],
};

export default mockArticle;
