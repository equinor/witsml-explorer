// The router needs to be dynamically imported to avoid "ReferenceError: document is not defined" when using createBrowserRouter.
import dynamic from "next/dynamic";
const Router = dynamic(() => import("../routes/Router"), {
  ssr: false
});

export default function Index() {
  return <Router />;
}
