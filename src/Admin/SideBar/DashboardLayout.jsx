import React, { useState } from "react";
import { Home, Users, UserCog, LayoutGrid, Key, BedDouble, Trash, ChevronDown, Folder, Tags, User, UserCheck, UserLockIcon, PersonStanding, SettingsIcon, UserPlus2, MessageSquare, Phone, CheckCheck, Star } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../Header/Header";
import { useLanguage } from "../../Language/LanguageContext";
import { translations } from "../../Language/translations";
import { FaQuestionCircle } from "react-icons/fa";
import { usePermissions } from "../../Context/PermissionContext";
import Loader from "../../components/Loader/Loader";

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language } = useLanguage();
    const t = translations[language];
    const { isHidden, loading } = usePermissions();
    const [openProperties, setOpenProperties] = useState(false);
    const [openCMS, setOpenCMS] = useState(false);
    const [openBlogs, setOpenBlogs] = useState(false);
    const [openUserManagement, setOpenUserManagement] = useState(false);
    const [openManageStaffs, setOpenManageStaffs] = useState(false);
    const [openOtherEnquiry, setOpenOtherEnquiry] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);

    // Sync sidebar state with current URL
    React.useEffect(() => {
        const path = location.pathname;

        if (path.includes('/dashboard/lease') || path.includes('/dashboard/sale') || path.includes('/dashboard/homestay')) {
            setOpenProperties(true);
        }

        if (path.includes('/dashboard/cms/home') ||
            path.includes('/dashboard/cms/about') ||
            path.includes('/dashboard/cms/contact') ||
            path.includes('/dashboard/cms/header') ||
            path.includes('/dashboard/cms/footer') ||
            path.includes('/dashboard/cms/agent') ||
            path.includes('/dashboard/cms/terms-conditions') ||
            path.includes('/dashboard/cms/privacy-policy') ||
            path.includes('/dashboard/cms/blog-banner')) {

            setOpenCMS(true);
        }

        if (path.includes('/dashboard/cms/categories') ||
            path.includes('/dashboard/cms/blogs') ||
            path.includes('/dashboard/cms/blog') || // Handles blog edit/create subpages
            path.includes('/dashboard/subscription')) {
            setOpenBlogs(true);
        }

        if (path.includes('/dashboard/user-details') || path.includes('/dashboard/enquiry')) {
            setOpenUserManagement(true);
        }

        if (path.includes('/dashboard/roles') || path.includes('/dashboard/staffs')) {
            setOpenManageStaffs(true);
        }

        if (path.includes('/dashboard/contact-enquiry')) {
            setOpenOtherEnquiry(true);
        }

        if (path.includes('/dashboard/settings/notification') || path.includes('/dashboard/settings/testimonials')) {
            setOpenSettings(true);
        }
    }, [location.pathname]);

    const isActive = (path) => location.pathname.startsWith(path);

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <Header showNavigation={false} />
            <div className="flex h-screen bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD] pt-4">

                {/* SIDEBAR */}
                <div className="w-[280px] flex flex-col items-center py-6 h-full overflow-y-auto scrollbar-hide">
                    <div className="flex flex-col w-full gap-4 px-4">
                        {/* MY PROFILE */}
                        <button
                            onClick={() => navigate("/dashboard/profile")}
                            className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                 ${isActive("/dashboard/profile") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
               `}
                        >
                            <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white"><User className="w-4 h-4" /></span>
                            <span className="text-sm font-medium">{t.myProfile}</span>
                        </button>

                        {/* PROPERTIES DROPDOWN */}
                        {(!isHidden("properties.lease") || !isHidden("properties.sale") || !isHidden("properties.homestay")) && (
                            <div className="w-full">
                                <button
                                    onClick={() => setOpenProperties(!openProperties)}
                                    className="group flex w-full items-center justify-between px-2 py-2 rounded-full
                hover:bg-[#41398B] hover:text-white transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white">
                                            <Home className="w-4 h-4" />
                                        </span>
                                        <span className="text-sm font-medium">{t.properties}</span>
                                    </div>
                                    <ChevronDown className={`transition ${openProperties ? "rotate-180" : ""}`} />
                                </button>

                                {openProperties && (
                                    <div className="ml-10 mt-2 flex flex-col gap-2">
                                        {/* LEASE */}
                                        {!isHidden("properties.lease") && (
                                            <button
                                                onClick={() => navigate("/dashboard/lease")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/lease") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <Key /> </span>
                                                <span>{t.lease}</span>
                                            </button>
                                        )}

                                        {/* SALE */}
                                        {!isHidden("properties.sale") && (
                                            <button
                                                onClick={() => navigate("/dashboard/sale")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/sale") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <Home /> </span>
                                                <span>{t.sale}</span>
                                            </button>
                                        )}

                                        {/* HOME STAY */}
                                        {!isHidden("properties.homestay") && (
                                            <button
                                                onClick={() => navigate("/dashboard/homestay")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/homestay") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <BedDouble /> </span>
                                                <span>{t.homeStay}</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CMS SETTINGS DROPDOWN */}
                        {(!isHidden("cms.homePage") || !isHidden("cms.aboutUs") || !isHidden("cms.contactUs") || !isHidden("cms.header") || !isHidden("cms.footer") || !isHidden("cms.agent") || !isHidden("cms.termsConditions") || !isHidden("cms.privacyPolicy") || !isHidden("cms.blogBanner")) && (

                            <div className="w-full">
                                <button
                                    onClick={() => setOpenCMS(!openCMS)}
                                    className="group flex w-full items-center justify-between px-2 py-2 rounded-full
                hover:bg-[#41398B] hover:text-white transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white">
                                            <LayoutGrid className="w-4 h-4" />
                                        </span>
                                        <span className="text-sm font-medium">{t.cmsAdmin}</span>
                                    </div>
                                    <ChevronDown className={`transition ${openCMS ? "rotate-180" : ""}`} />
                                </button>

                                {openCMS && (
                                    <div className="ml-10 mt-2 flex flex-col gap-2">
                                        {/* HOME PAGE */}
                                        {!isHidden("cms.homePage") && (
                                            <button
                                                onClick={() => navigate("/dashboard/cms/home")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/home") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <Home /> </span>
                                                <span>{t.home || "Home Page"}</span>
                                            </button>
                                        )}

                                        {/* ABOUT US */}
                                        {!isHidden("cms.aboutUs") && (
                                            <button
                                                onClick={() => navigate("/dashboard/cms/about")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/about") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <Users /> </span>
                                                <span>{t.aboutUs}</span>
                                            </button>
                                        )}

                                        {/* CONTACT */}
                                        {!isHidden("cms.contactUs") && (
                                            <button
                                                onClick={() => navigate("/dashboard/cms/contact")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/contact") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <UserCog /> </span>
                                                <span>{t.contact}</span>
                                            </button>
                                        )}

                                        {/* HEADER */}
                                        {!isHidden("cms.header") && (
                                            <button
                                                onClick={() => navigate("/dashboard/cms/header")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/header") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <LayoutGrid /> </span>
                                                <span>{t.header}</span>
                                            </button>
                                        )}

                                        {/* FOOTER */}
                                        {!isHidden("cms.footer") && (
                                            <button
                                                onClick={() => navigate("/dashboard/cms/footer")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/footer") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <LayoutGrid /> </span>
                                                <span>{t.footer}</span>
                                            </button>
                                        )}

                                        {/* AGENT */}
                                        {!isHidden("cms.agent") && (
                                            <button
                                                onClick={() => navigate("/dashboard/cms/agent")}
                                                className={`cursor-pointer group flex items-center gap-2 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/agent") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <User /> </span>
                                                <span className="text-sm">{t.agent}</span>
                                            </button>
                                        )}
                                        {/* TERMS & CONDITIONS */}
                                        {!isHidden("cms.termsConditions") && (
                                            <button
                                                onClick={() => navigate("/dashboard/cms/terms-conditions")}
                                                className={`cursor-pointer group flex items-center gap-2 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/terms-conditions") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <LayoutGrid /> </span>
                                                <span className="text-sm">{t.termsConditions || "Terms & Conditions"}</span>
                                            </button>
                                        )}
                                        {/* PRIVACY POLICY */}
                                        {!isHidden("cms.privacyPolicy") && (
                                            <button
                                                onClick={() => navigate("/dashboard/cms/privacy-policy")}
                                                className={`cursor-pointer group flex items-center gap-2 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/privacy-policy") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <LayoutGrid /> </span>
                                                <span className="text-sm">{t.privacyPolicy || "Privacy Policy"}</span>
                                            </button>
                                        )}

                                        {/* BLOG BANNER */}
                                        {!isHidden("cms.blogBanner") && (
                                            <button
                                                onClick={() => navigate("/dashboard/cms/blog-banner")}
                                                className={`cursor-pointer group flex items-center gap-2 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/blog-banner") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <LayoutGrid /> </span>
                                                <span className="text-sm">{t.blogBanner}</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* BLOGS DROPDOWN */}
                        {(!isHidden("blogs.category") || !isHidden("blogs.blogCms") || !isHidden("blogs.subscription")) && (
                            <div className="w-full">
                                <button
                                    onClick={() => setOpenBlogs(!openBlogs)}
                                    className="group flex w-full items-center justify-between px-2 py-2 rounded-full
                hover:bg-[#41398B] hover:text-white transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white">
                                            <Folder className="w-4 h-4" />
                                        </span>
                                        <span className="text-sm font-medium">{t.blogs}</span>
                                    </div>
                                    <ChevronDown className={`transition ${openBlogs ? "rotate-180" : ""}`} />
                                </button>

                                {openBlogs && (
                                    <div className="ml-10 mt-2 flex flex-col gap-2">
                                        {/* CATEGORY */}
                                        {!isHidden("blogs.category") && (
                                            <button
                                                onClick={() => navigate("/dashboard/cms/categories")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/categories") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <Tags /> </span>
                                                <span>{t.categories}</span>
                                            </button>
                                        )}

                                        {/* ADD BLOG */}
                                        {!isHidden("blogs.blogCms") && (
                                            <button
                                                onClick={() => navigate("/dashboard/cms/blogs")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/cms/blogs") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <Folder /> </span>
                                                <span>{t.addBlog || "Blog Cms"}</span>
                                            </button>
                                        )}

                                        {/* SUBSCRIPTION */}
                                        {!isHidden("blogs.subscription") && (
                                            <button
                                                onClick={() => navigate("/dashboard/subscription")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/subscription") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <CheckCheck /> </span>
                                                <span>{t.subscription}</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* USERMANAGEMENT DROPDOWN */}
                        {(!isHidden("userManagement.userDetails") || !isHidden("userManagement.enquires")) && (
                            <div className="w-full">
                                <button
                                    onClick={() => setOpenUserManagement(!openUserManagement)}
                                    className="group flex w-full items-center justify-between px-2 py-2 rounded-full
                hover:bg-[#41398B] hover:text-white transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white">
                                            <UserCheck className="w-4 h-4" />
                                        </span>
                                        <span>{t.userManagement}</span>
                                    </div>
                                    <ChevronDown className={`transition ${openUserManagement ? "rotate-180" : ""}`} />
                                </button>

                                {openUserManagement && (
                                    <div className="ml-10 mt-2 flex flex-col gap-2">
                                        {/* USER DETAILS */}
                                        {!isHidden("userManagement.userDetails") && (
                                            <button
                                                onClick={() => navigate("/dashboard/user-details")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/user-details") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <UserLockIcon /> </span>
                                                <span>{t.userDetails}</span>
                                            </button>
                                        )}

                                        {/* ENQUIRES */}
                                        {!isHidden("userManagement.enquires") && (
                                            <button
                                                onClick={() => navigate("/dashboard/enquiry")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/enquiry") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <FaQuestionCircle /> </span>
                                                <span>{t.enquires}</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STAFF MANAGEMENT DROPDOWN */}
                        {(!isHidden("menuStaffs.roles") || !isHidden("menuStaffs.staffs")) && (
                            <div className="w-full">
                                <button
                                    onClick={() => setOpenManageStaffs(!openManageStaffs)}
                                    className="group flex w-full items-center justify-between px-2 py-2 rounded-full
                hover:bg-[#41398B] hover:text-white transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white">
                                            <PersonStanding className="w-4 h-4" />
                                        </span>
                                        <span>{t.manageStaffs}</span>
                                    </div>
                                    <ChevronDown className={`transition ${openManageStaffs ? "rotate-180" : ""}`} />
                                </button>

                                {openManageStaffs && (
                                    <div className="ml-10 mt-2 flex flex-col gap-2">
                                        {/* ROLES */}
                                        {!isHidden("menuStaffs.roles") && (
                                            <button
                                                onClick={() => navigate("/dashboard/roles")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/roles") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <SettingsIcon /> </span>
                                                <span>{t.roles}</span>
                                            </button>
                                        )}

                                        {/* STAFFS */}
                                        {!isHidden("menuStaffs.staffs") && (
                                            <button
                                                onClick={() => navigate("/dashboard/staffs")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/staffs") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <UserPlus2 /> </span>
                                                <span>{t.staffs}</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* OTHER ENQUIRY DROPDOWN */}
                        {(!isHidden("otherEnquiry.contactEnquiry")) && (
                            <div className="w-full">
                                <button
                                    onClick={() => setOpenOtherEnquiry(!openOtherEnquiry)}
                                    className="group flex w-full items-center justify-between px-2 py-2 rounded-full
                hover:bg-[#41398B] hover:text-white transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white">
                                            <MessageSquare className="w-4 h-4" />
                                        </span>
                                        <span>{t.otherEnquiry}</span>
                                    </div>
                                    <ChevronDown className={`transition ${openOtherEnquiry ? "rotate-180" : ""}`} />
                                </button>

                                {openOtherEnquiry && (
                                    <div className="ml-10 mt-2 flex flex-col gap-2">
                                        {/* CONTACT ENQUIRY */}
                                        {!isHidden("otherEnquiry.contactEnquiry") && (
                                            <button
                                                onClick={() => navigate("/dashboard/contact-enquiry")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                      ${isActive("/dashboard/contact-enquiry") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                    `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <Phone /> </span>
                                                <span>{t.contactEnquiry}</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SETTINGS DROPDOWN */}
                        {(!isHidden("settings.notification") || !isHidden("settings.testimonials")) && (
                            <div className="w-full">
                                <button
                                    onClick={() => setOpenSettings(!openSettings)}
                                    className="group flex w-full items-center justify-between px-2 py-2 rounded-full
                 hover:bg-[#41398B] hover:text-white transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white">
                                            <SettingsIcon className="w-4 h-4" />
                                        </span>
                                        <span>{t.settings}</span>
                                    </div>
                                    <ChevronDown className={`transition ${openSettings ? "rotate-180" : ""}`} />
                                </button>

                                {openSettings && (
                                    <div className="ml-10 mt-2 flex flex-col gap-2">
                                        {/* NOTIFICATION */}
                                        <button
                                            onClick={() => navigate("/dashboard/settings/notification")}
                                            className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                       ${isActive("/dashboard/settings/notification") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                     `}
                                        >
                                            <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <MessageSquare /> </span>
                                            <span>{t.notification}</span>
                                        </button>

                                        {/* TESTIMONIALS */}
                                        {!isHidden("settings.testimonials") && (
                                            <button
                                                onClick={() => navigate("/dashboard/settings/testimonials")}
                                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                                   ${isActive("/dashboard/settings/testimonials") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
                                 `}
                                            >
                                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"> <Star /> </span>
                                                <span>{t.testimonials}</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* OTHER PAGES */}

                        {/* LANDLORDS */}
                        {!isHidden("landlords") && (
                            <button
                                onClick={() => navigate("/dashboard/landlords")}
                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                 ${isActive("/dashboard/landlords") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
               `}
                            >
                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"><Users /></span>
                                <span>{t.owners}</span>
                            </button>
                        )}


                        {/* MASTERS */}
                        {!isHidden("masters") && (
                            <button
                                onClick={() => navigate("/dashboard/masters")}
                                className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                 ${isActive("/dashboard/masters") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
               `}
                            >
                                <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"><LayoutGrid /></span>
                                <span>{t.masters}</span>
                            </button>
                        )}

                        {/* TRASH */}
                        <button
                            onClick={() => navigate("/dashboard/trash")}
                            className={`cursor-pointer group flex items-center gap-3 px-2 py-2 rounded-full transition 
                 ${isActive("/dashboard/trash") ? "bg-[#41398B] text-white" : "hover:bg-[#41398B] hover:text-white"}
               `}
                        >
                            <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B]"><Trash /></span>
                            <span>{t.trash}</span>
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

export default DashboardLayout;