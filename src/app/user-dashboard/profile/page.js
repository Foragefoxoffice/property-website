import ProfileClient from "../../profile/ProfileClient";

export const metadata = {
    title: "My Profile | User Dashboard",
    description: "Manage your account settings and password in the dashboard.",
};

export default function Page() {
    return <ProfileClient isDashboard={true} />;
}
