// Wires the shared SEO landing loader for the `inflatable-rentals` service.
import {
  landingStaticParams,
  makeLandingMetadata,
  makeLandingPage,
} from "@/lib/seo/landing-page-loader";

export const dynamic = "force-dynamic";
export const generateStaticParams = landingStaticParams;
export const generateMetadata = makeLandingMetadata("inflatable-rentals");
export default makeLandingPage("inflatable-rentals");
