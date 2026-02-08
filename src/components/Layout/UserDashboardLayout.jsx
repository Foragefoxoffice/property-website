import React, { useState } from "react";
import { Heart, User, ChevronDown, LogOut, MessageSquare } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../../Admin/Header/Header";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import Loader from "../../components/Loader/Loader";

const UserDashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();
    const t = translations[language];
    const [loading, setLoading] = useState(false);

    const isActive = (path) => location.pathname.startsWith(path);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <Header />
            <div className="flex h-screen bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD] pt-4">

                {/* SIDEBAR */}
                <div className="w-[280px] flex flex-col items-center py-6 h-full overflow-y-auto scrollbar-hide">
                    <div className="flex flex-col w-full gap-4 px-4">
                        {/* MY PROFILE */}
                        <button
                            onClick={() => navigate("/user-dashboard/profile")}
                            className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                                ${isActive("/user-dashboard/profile") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                            `}
                        >
                            <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white"><User size={20} /></span>
                            <span className="font-medium">{t.myProfile}</span>
                        </button>
                        {/* MY FAVORITES */}
                        <button
                            onClick={() => navigate("/user-dashboard")}
                            className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                                ${location.pathname === "/user-dashboard" || isActive("/user-dashboard/favorites") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                            `}
                        >
                            <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white"><Heart size={20} /></span>
                            <span className="font-medium">{t.myFavorites}</span>
                        </button>
                        {/* GIVE TESTIMONIAL */}
                        <button
                            onClick={() => navigate("/user-dashboard/give-testimonial")}
                            className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                                ${isActive("/user-dashboard/give-testimonial") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                            `}
                        >
                            <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white"><MessageSquare size={20} /></span>
                            <span className="font-medium">{t.giveTestimonial}</span>
                        </button>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="flex-1 overflow-auto p-4">
                    <Outlet />
                </div>

            </div>
        </>
    );
};

export default UserDashboardLayout;
