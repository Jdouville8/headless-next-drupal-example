// site-data.ts
//
// Static site-chrome content used by the header and footer. In a Drupal-backed
// production build this would come from menu blocks / config — for the
// mock-only path, the values are inlined here so the components stay
// declarative and server-renderable. The shape mirrors `article-data.jsx`'s
// `SITE` global from the prototype.

import type { IconName } from "@/components/site/Icon";

export type UtilityNavItem = { label: string; icon: IconName; href?: string };

export type FooterColumn = { heading: string; links: string[] };

export type SiteChrome = {
  brand: { name: string; mark: string };
  utility_nav: UtilityNavItem[];
  region: string;
  primary_nav: string[];
  footer: {
    columns: FooterColumn[];
    partnerships_heading: string;
    partnerships: string[];
    social: Array<"facebook" | "x" | "youtube" | "instagram" | "linkedin">;
    legal_links: string[];
    tagline: { primary: string; secondary: string };
  };
};

export const SITE: SiteChrome = {
  brand: { name: "Meridian", mark: "M" },
  utility_nav: [
    { label: "Search", icon: "search" },
    { label: "Product Finder", icon: "finder" },
    { label: "Locations", icon: "map" },
    { label: "Promotions", icon: "tag" },
    { label: "Contact Us", icon: "mail" },
  ],
  region: "UNITED STATES: ENGLISH",
  primary_nav: ["Products", "Partner Solutions", "About Us", "Careers"],
  footer: {
    columns: [
      {
        heading: "Learn More",
        links: ["About Meridian Group", "Careers", "Corporate Newsroom"],
      },
      {
        heading: "Useful Links",
        links: [
          "Customer Portal ↗",
          "Safety Data Sheets ↗",
          "Product Information Sheets ↗",
          "Operator Database ↗",
          "Global Standards of Business",
          "Suppliers",
          "Express Service ↗",
        ],
      },
    ],
    partnerships_heading: "Continental Partnerships",
    partnerships: [
      "Apex Freight Alliance",
      "North & Vale Studio",
      "Continental Logistics Council",
    ],
    social: ["facebook", "x", "youtube", "instagram", "linkedin"],
    legal_links: ["Legal Notices", "Do Not Sell My Personal Data", "Sitemap"],
    tagline: {
      primary: "The Operator's Brand",
      secondary: "Continental Fluids · est. 1925",
    },
  },
};
