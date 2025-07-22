import BusinessList from "./components/businessList";
import { redirect } from "next/navigation";
import { getServerAuthToken } from "../lib/auth";

export default async function Page() {
  const token = await getServerAuthToken();
  if (!token) {
    redirect("/login");
  }
  return <BusinessList />;
}
