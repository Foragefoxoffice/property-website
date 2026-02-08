import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Select, Spin } from 'antd';
import {
    getAllProperties,
    getAllZoneSubAreas,
    getAllPropertyTypes,
    getAllCurrencies,
    getAllBlocks
} from '../../Api/action';
import { SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../../Language/LanguageContext';
import { usePermissions } from '../../Context/PermissionContext';
import { translations } from '../../Language/translations';

export default function HomeBanner({ homePageData }) {
    const router = useRouter();
    const { language } = useLanguage();
    const t = translations[language]; // Initialize translations
    const { can } = usePermissions();
    const [selectedTab, setSelectedTab] = useState('For Lease');
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    // Dropdown data
    const [projects, setProjects] = useState([]);
    const [zones, setZones] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [projectsAll, setProjectsAll] = useState([]);
    const [zonesAll, setZonesAll] = useState([]);
    const [blocksAll, setBlocksAll] = useState([]);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    // Comprehensive filters matching ListingPage
    const [filters, setFilters] = useState({
        propertyId: '',
        keyword: '',
        projectId: '',
        zoneId: '',
        blockId: '',
        propertyType: '',
        bedrooms: '',
        bathrooms: '',
        currency: '',
        minPrice: '',
        maxPrice: ''
    });

    // Load dropdown data on mount
    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                const [projectsRes, zonesRes, blocksRes, typesRes, currenciesRes] = await Promise.all([
                    getAllProperties(),
                    getAllZoneSubAreas(),
                    getAllBlocks(),
                    getAllPropertyTypes(),
                    getAllCurrencies()
                ]);

                // ✅ Filter to only show Active items in dropdowns
                const filterActive = (items) => items.filter(item => item.status === "Active");

                const activeProjects = filterActive(projectsRes.data?.data || []);
                const activeZones = filterActive(zonesRes.data?.data || []);
                const activeBlocks = filterActive(blocksRes.data?.data || []);

                setProjectsAll(activeProjects);
                setZonesAll(activeZones);
                setBlocksAll(activeBlocks);

                setProjects(activeProjects);
                // Initial lists are empty until parent is selected, or we show all?
                // The concept in Filter.jsx/ListingPage.jsx is: Zones empty until Project selected.
                setZones([]);
                setBlocks([]);

                // ✅ Filter property types based on permissions
                const activeTypes = filterActive(typesRes.data?.data || []);
                const filteredTypes = activeTypes.filter(type => {
                    // Check permissions for each transaction type
                    const hasLeaseAccess = can('properties.lease', 'view');
                    const hasSaleAccess = can('properties.sale', 'view');
                    const hasHomestayAccess = can('properties.homestay', 'view');

                    // If user has access to all, show all types
                    if (hasLeaseAccess && hasSaleAccess && hasHomestayAccess) {
                        return true;
                    }
                    return true;
                });

                setPropertyTypes(filteredTypes);
                setCurrencies(filterActive(currenciesRes.data?.data || []));
            } catch (error) {
                console.error('Error loading dropdown data:', error);
            }
        };

        loadDropdownData();
    }, [can]);

    const getLocalizedValue = (value) => {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return language === 'vi' ? (value.vi || value.en || '') : (value.en || value.vi || '');
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [key]: value };
            // Hierarchical clearing logic
            if (key === 'projectId') {
                newFilters.zoneId = '';
                newFilters.blockId = '';
            } else if (key === 'zoneId') {
                newFilters.blockId = '';
            }
            return newFilters;
        });
    };

    // ✅ Hierarchical Filtering Logic (Project -> Area -> Block)
    useEffect(() => {
        const selectedProjectName = filters.projectId;
        if (!selectedProjectName) {
            setZones([]);
            setBlocks([]);
            return;
        }

        const project = projectsAll.find(p => getLocalizedValue(p.name) === selectedProjectName);
        const projectId = project?._id;

        if (projectId) {
            const filteredZones = zonesAll.filter(z => {
                const pId = typeof z.property === 'string' ? z.property : z.property?._id;
                return pId === projectId;
            });
            setZones(filteredZones);
        } else {
            setZones([]);
        }
    }, [filters.projectId, zonesAll, projectsAll]);

    useEffect(() => {
        const selectedZoneName = filters.zoneId;
        if (!selectedZoneName) {
            setBlocks([]);
            return;
        }

        const zone = zonesAll.find(z => getLocalizedValue(z.name) === selectedZoneName);
        const zoneId = zone?._id;

        if (zoneId) {
            const filteredBlocks = blocksAll.filter(b => {
                const zId = typeof b.zone === 'string' ? b.zone : b.zone?._id;
                return zId === zoneId;
            });
            setBlocks(filteredBlocks);
        } else {
            setBlocks([]);
        }
    }, [filters.zoneId, blocksAll, zonesAll]);

    const handleSearch = () => {
        // Navigate to listing page with filters
        let category = 'Lease';
        if (selectedTab === 'For Sale') category = 'Sale';
        if (selectedTab === 'Home Stay') category = 'Home Stay';

        const params = new URLSearchParams({
            type: category,
            ...(filters.propertyId && { propertyId: filters.propertyId }),
            ...(filters.keyword && { keyword: filters.keyword }),
            ...(filters.projectId && { projectId: filters.projectId }),
            ...(filters.zoneId && { zoneId: filters.zoneId }),
            ...(filters.blockId && { blockId: filters.blockId }),
            ...(filters.propertyType && { propertyType: filters.propertyType }),
            ...(filters.bedrooms && { bedrooms: filters.bedrooms }),
            ...(filters.bathrooms && { bathrooms: filters.bathrooms }),
            ...(filters.currency && { currency: filters.currency }),
            ...(filters.minPrice && { minPrice: filters.minPrice }),
            ...(filters.maxPrice && { maxPrice: filters.maxPrice })
        });
        router.push(`/listing?${params.toString()}`);
    };

    // Helper function to get full image URL
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        // If it's already a full URL, return as is
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        // Otherwise, prepend the backend base URL
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.placetest.in/api/v1';
        const serverURL = baseURL.replace('/api/v1', '');
        return `${serverURL}${imagePath}`;
    };

    return (
        <>
            <div className="relative min-h-[70vh] md:min-h-[100vh] bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: homePageData?.backgroundImage
                        ? `url(${getImageUrl(homePageData.backgroundImage)})`
                        : 'url("/images/property/home-banner.jpg")'
                }}>
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                    {/* Title & Description */}
                    <div className="text-center mb-12">
                        <h1 className="text-5xl md:text-8xl font-medium text-white mb-4 animate-fadeInUp">
                            {language === 'en'
                                ? (homePageData?.heroTitle_en || 'Find The Best Place')
                                : (homePageData?.heroTitle_vn || 'Tìm Nơi Tốt Nhất')
                            }
                        </h1>
                        <p className="text-xl text-gray-200 font-medium max-w-2xl mx-auto animate-fadeInUp animation-delay-200">
                            {language === 'en'
                                ? (homePageData?.heroDescription_en || 'This stunning coastal villa in Malibu offers panoramic ocean views, open-concept living, and elegant modern design.')
                                : (homePageData?.heroDescription_vn || 'Biệt thự ven biển tuyệt đẹp này ở Malibu mang đến tầm nhìn toàn cảnh ra đại dương, không gian sống mở và thiết kế hiện đại thanh lịch.')
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Card */}
            <div className='mt-[-80px] relative z-20 animate-slideUpFade animation-delay-400'>
                {/* Tabs */}
                <div className="flex gap-3 justify-center">
                    <button
                        className={`px-2 py-3 md:py-3 md:px-8 rounded-t-md font-semibold text-base cursor-pointer transition-all ${selectedTab === 'For Lease'
                            ? 'bg-[#fff] text-[#41398B]'
                            : 'bg-[#00000066] text-[#fff] hover:bg-gray-200 hover:text-[#41398B]'
                            }`}
                        onClick={() => setSelectedTab('For Lease')}
                    >
                        {t.forRent}
                    </button>
                    <button
                        className={`px-2 py-3 md:py-3 md:px-8 rounded-t-md font-semibold text-base cursor-pointer transition-all ${selectedTab === 'For Sale'
                            ? 'bg-[#fff] text-[#41398B]'
                            : 'bg-[#00000066] text-[#fff] hover:bg-gray-200 hover:text-[#41398B]'
                            }`}
                        onClick={() => setSelectedTab('For Sale')}
                    >
                        {t.forSale}
                    </button>
                    <button
                        className={`px-2 py-3 md:py-3 md:px-8 rounded-t-md font-semibold text-base cursor-pointer transition-all ${selectedTab === 'Home Stay'
                            ? 'bg-[#fff] text-[#41398B]'
                            : 'bg-[#00000066] text-[#fff] hover:bg-gray-200 hover:text-[#41398B]'
                            }`}
                        onClick={() => setSelectedTab('Home Stay')}
                    >
                        {t.homeStay}
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 max-w-7xl mx-auto">
                    {/* Main Filters Row - Horizontal Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 pt-2">
                        {/* Looking For (Keyword) */}
                        <div>
                            <label className="block text-md font-bold text-black mb-2">
                                {language === 'en' ? 'Looking For' : 'Tìm Kiếm'}
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                placeholder={language === 'en' ? 'Search keyword' : 'Từ khóa tìm kiếm'}
                                value={filters.keyword}
                                onChange={(e) => handleFilterChange('keyword', e.target.value)}
                            />
                        </div>

                        {/* Project / Community */}
                        <div>
                            <label className="block text-md font-bold text-black mb-2">
                                {t.projectCommunity}
                            </label>
                            <Select
                                className="custom-selectss"
                                popupClassName="custom-dropdown"
                                value={filters.projectId || undefined}
                                onChange={(value) => handleFilterChange('projectId', value || '')}
                                placeholder={language === 'en' ? 'Select Project' : 'Chọn Dự Án'}
                                style={{ width: '100%' }}
                                size="large"
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {projects.map((project) => (
                                    <Select.Option key={project._id} value={getLocalizedValue(project.name)}>
                                        {getLocalizedValue(project.name) || 'Unnamed'}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>

                        {/* Area / Zone */}
                        <div>
                            <label className="block text-md font-bold text-black mb-2">
                                {t.areaZone}
                            </label>
                            <Select
                                className="custom-selectss"
                                popupClassName="custom-dropdown"
                                value={filters.zoneId || undefined}
                                onChange={(value) => handleFilterChange('zoneId', value || '')}
                                placeholder={language === 'en' ? 'Select Area/Zone' : 'Chọn Khu Vực'}
                                style={{ width: '100%' }}
                                size="large"
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {zones.map((zone) => (
                                    <Select.Option key={zone._id} value={getLocalizedValue(zone.name)}>
                                        {getLocalizedValue(zone.name) || 'Unnamed'}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>

                        {/* Block Name */}
                        <div>
                            <label className="block text-md font-bold text-black mb-2">
                                {t.blockName}
                            </label>
                            <Select
                                className="custom-selectss"
                                popupClassName="custom-dropdown"
                                value={filters.blockId || undefined}
                                onChange={(value) => handleFilterChange('blockId', value || '')}
                                placeholder={language === 'en' ? 'Select Block' : 'Chọn Khối'}
                                style={{ width: '100%' }}
                                size="large"
                                allowClear
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                            >
                                {blocks.map((block) => (
                                    <Select.Option key={block._id} value={getLocalizedValue(block.name)}>
                                        {getLocalizedValue(block.name) || 'Unnamed'}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>

                        {/* Bottom Row - Show More Button & Search Button */}
                        <div className="flex items-end gap-3">
                            {/* Show More Filters Button */}
                            <button
                                className="flex items-center gap-2 px-4 py-3 border cursor-pointer border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                                onClick={() => setShowMoreFilters(!showMoreFilters)}
                            >
                                <SlidersHorizontal />
                            </button>

                            {/* Search Button */}
                            <button
                                className="px-8 py-2.5 bg-[#41398B] hover:bg-[#41398be1] text-white font-bold rounded-lg hover:shadow-xl cursor-pointer hover:-translate-y-0.5 active:translate-y-0 transition-all"
                                onClick={handleSearch}
                            >
                                {language === 'en' ? 'Search' : 'Tìm Kiếm'}
                            </button>
                        </div>
                    </div>

                    {/* Expandable More Filters Section */}
                    <div
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${showMoreFilters ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                            }`}
                    >
                        <div className={`mb-6 transform transition-all duration-500 ${showMoreFilters ? 'translate-y-0' : '-translate-y-4'
                            }`}>
                            {/* Hidden Filters Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                                {/* Bedrooms */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        {language === 'en' ? 'Bedrooms' : 'Phòng Ngủ'}
                                    </label>
                                    <Select
                                        className="custom-selectss"
                                        popupClassName="custom-dropdown"
                                        value={filters.bedrooms || undefined}
                                        onChange={(value) => handleFilterChange('bedrooms', value || '')}
                                        placeholder={language === 'en' ? 'Any Bedrooms' : 'Bất Kỳ'}
                                        style={{ width: '100%' }}
                                        size="large"
                                        allowClear
                                    >
                                        <Select.Option value="1">1</Select.Option>
                                        <Select.Option value="2">2</Select.Option>
                                        <Select.Option value="3">3</Select.Option>
                                        <Select.Option value="4">4+</Select.Option>
                                    </Select>
                                </div>

                                {/* Bathrooms */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        {language === 'en' ? 'Bathrooms' : 'Phòng Tắm'}
                                    </label>
                                    <Select
                                        className="custom-selectss"
                                        popupClassName="custom-dropdown"
                                        value={filters.bathrooms || undefined}
                                        onChange={(value) => handleFilterChange('bathrooms', value || '')}
                                        placeholder={language === 'en' ? 'Any' : 'Bất Kỳ'}
                                        style={{ width: '100%' }}
                                        size="large"
                                        allowClear
                                    >
                                        <Select.Option value="1">1</Select.Option>
                                        <Select.Option value="2">2</Select.Option>
                                        <Select.Option value="3">3+</Select.Option>
                                    </Select>
                                </div>

                                {/* Property Type */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        {language === 'en' ? 'Property Type' : 'Loại Bất Động Sản'}
                                    </label>
                                    <Select
                                        className="custom-selectss"
                                        popupClassName="custom-dropdown"
                                        value={filters.propertyType || undefined}
                                        onChange={(value) => handleFilterChange('propertyType', value || '')}
                                        placeholder={language === 'en' ? 'Select Type' : 'Chọn Loại'}
                                        style={{ width: '100%' }}
                                        size="large"
                                        allowClear
                                        showSearch
                                        filterOption={(input, option) =>
                                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                    >
                                        {propertyTypes.map((type) => (
                                            <Select.Option key={type._id} value={getLocalizedValue(type.name)}>
                                                {getLocalizedValue(type.name) || 'Unnamed'}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </div>

                                {/* Currency */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        {language === 'en' ? 'Currency' : 'Tiền Tệ'}
                                    </label>
                                    <Select
                                        className="custom-selectss"
                                        popupClassName="custom-dropdown"
                                        value={filters.currency || undefined}
                                        onChange={(value) => handleFilterChange('currency', value || '')}
                                        placeholder={language === 'en' ? 'Select Currency' : 'Chọn Tiền Tệ'}
                                        style={{ width: '100%' }}
                                        size="large"
                                        allowClear
                                    >
                                        {currencies.map((curr) => {
                                            const name = getLocalizedValue(curr.currencyName) || 'N/A';
                                            const code = getLocalizedValue(curr.currencyCode) || '';
                                            return (
                                                <Select.Option key={curr._id} value={code}>
                                                    {name}
                                                </Select.Option>
                                            );
                                        })}
                                    </Select>
                                </div>

                                {/* Min Price */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        {language === 'en' ? 'Min Price' : 'Giá Tối Thiểu'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                        placeholder={language === 'en' ? 'Min' : 'Tối Thiểu'}
                                        value={filters.minPrice}
                                        onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    />
                                </div>

                                {/* Max Price */}
                                <div>
                                    <label className="block text-md font-bold text-black mb-2">
                                        {language === 'en' ? 'Max Price' : 'Giá Tối Đa'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 hover:border-[#41398B] focus:outline-none focus:border-[#41398B] focus:ring-2 focus:ring-[#41398B]/20 transition-all"
                                        placeholder={language === 'en' ? 'Max' : 'Tối Đa'}
                                        value={filters.maxPrice}
                                        onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
