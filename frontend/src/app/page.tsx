import { redirect } from "next/navigation";

/** Root page — redirects to /resources. */
export default function Home() {
  redirect("/resources");
}
