import FavoritesClient from "./FavoritesClient";

export const metadata = {
    title: "My Favorites | Property Portal",
    description: "View and manage your favorite properties.",
};

export default function Page() {
    return <FavoritesClient />;
}
