// Wires the shared SEO landing loader for the `bounce-house-rentals` service.
import {
  landingStaticParams,
  makeLandingMetadata,
  makeLandingPage,
} from "@/lib/seo/landing-page-loader";

export const dynamic = "force-dynamic";
export const generateStaticParams = landingStaticParams;
export const generateMetadata = makeLandingMetadata("bounce-house-rentals");
export default makeLandingPage("bounce-house-rentals");
