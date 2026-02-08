import FavoritesClient from "../../favorites/FavoritesClient";

export const metadata = {
    title: "My Favorites | User Dashboard",
    description: "View and manage your favorite properties in the dashboard.",
};

export default function Page() {
    return <FavoritesClient isDashboard={true} />;
}
