// Wires the shared SEO landing loader for the `table-and-chair-rentals` service.
import {
  landingStaticParams,
  makeLandingMetadata,
  makeLandingPage,
} from "@/lib/seo/landing-page-loader";

export const dynamic = "force-dynamic";
export const generateStaticParams = landingStaticParams;
export const generateMetadata = makeLandingMetadata("table-and-chair-rentals");
export default makeLandingPage("table-and-chair-rentals");
