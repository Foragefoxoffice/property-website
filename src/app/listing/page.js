import ListingClient from "./ListingClient";

export async function generateMetadata({ searchParams }) {
    const type = (await searchParams).type || "All";

    const titles = {
        All: "All Properties | Property Portal",
        Lease: "Properties for Rent/Lease | Property Portal",
        Sale: "Properties for Sale | Property Portal",
        "Home Stay": "Homestays & Short Term Stays | Property Portal",
    };

    const descriptions = {
        All: "Browse our extensive list of properties for sale, rent, and homestay.",
        Lease: "Find the perfect property for rent or lease in your desired location.",
        Sale: "Explore premium properties for sale. Investment opportunities and dream homes.",
        "Home Stay": "Book comfortable homestays for your next trip or short stay.",
    };

    return {
        title: titles[type] || titles.All,
        description: descriptions[type] || descriptions.All,
    };
}

export default function Page() {
    return <ListingClient />;
}
