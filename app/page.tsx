import { redirect } from "next/navigation";

export default function Home() {
  // For now, redirect to feed as the main landing page
  // TODO: Create a proper landing page
  redirect("/feed");
}
