import { Metadata } from "next";

// Metadata preserved from feature/loyalty-admin's /restaurants page.
export const metadata: Metadata = {
  title: "Find Restaurants | Anli",
  description: "Explore and book the best restaurants near you with Anli.",
};

export default function RestaurantsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
