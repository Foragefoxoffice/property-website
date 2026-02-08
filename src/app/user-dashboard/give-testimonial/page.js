import GiveTestimonialClient from "../../give-testimonial/GiveTestimonialClient";

export const metadata = {
    title: "Give Testimonial | User Dashboard",
    description: "Share your experience and feedback with us.",
};

export default function Page() {
    return <GiveTestimonialClient isDashboard={true} />;
}
