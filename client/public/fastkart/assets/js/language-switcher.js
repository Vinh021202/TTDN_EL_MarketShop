/**
 * Language & Currency Switcher with Full Translation
 * Fastkart E-commerce Template
 */
(function () {
    // Extended Translation Dictionary
    const translations = {
        'Vietnamese': {
            currency: 'VND',
            currencySymbol: '₫',
            // Header & Navigation
            'All Categories': 'Tất cả danh mục',
            'Home': 'Trang chủ',
            'Shop': 'Cửa hàng',
            'Product': 'Sản phẩm',
            'Mega Menu': 'Menu lớn',
            'Blog': 'Bài viết',
            'Pages': 'Trang',
            'Seller': 'Người bán',
            'Your Location': 'Vị trí của bạn',
            'Hot Deals': 'Ưu đãi hot',
            'View Cart': 'Xem giỏ',
            'Checkout': 'Thanh toán',
            'Price': 'Giá',
            // Category Slider
            'Oils, Refined & Ghee': 'Dầu ăn & Bơ',
            'Rice, Flour & Grains': 'Gạo & Ngũ cốc',
            'Food Cupboard': 'Tủ thực phẩm',
            'Dals & Pulses': 'Đậu & Hạt',
            'Drinks & Beverages': 'Đồ uống',
            'Fresh Fruits & Vegetables': 'Rau củ tươi',
            'Ready to eat Meals': 'Đồ ăn sẵn',
            'Vegetables & Fruit': 'Rau & Trái cây',
            'Beverages': 'Đồ uống',
            'Beverage': 'Đồ uống',
            'Meats & Seafood': 'Thịt & Hải sản',
            'Breakfast & Dairy': 'Bữa sáng & Sữa',
            'Frozen Foods': 'Thực phẩm đông lạnh',
            'Biscuits & Snacks': 'Bánh & Snack',
            'Grocery & Staples': 'Tạp hóa',
            'Dairy': 'Sữa',
            // Home Section
            'ORGANIC': 'HỮU CƠ',
            '100% Fresh': '100% Tươi ngon',
            'Fruit & Vegetables': 'Trái cây & Rau củ',
            'Fruits & Vegetables': 'Trái cây & Rau củ',
            'Free shipping on all your order. we deliver you enjoy': 'Miễn phí giao hàng. Chúng tôi giao, bạn tận hưởng',
            'Shop Now': 'Mua ngay',
            'Fresh & 100% Organic': 'Tươi & 100% Hữu cơ',
            "farmer's market": 'Chợ nông sản',
            'Organic Lifestyle': 'Lối sống hữu cơ',
            'Best Weekend Sales': 'Giảm giá cuối tuần',
            'Safe food saves lives': 'Thực phẩm an toàn',
            'Discount Offer': 'Ưu đãi giảm giá',
            'AVAILABLE': 'CÓ SẴN',
            'PREVIEW': 'XEM TRƯỚC',
            '100% Natural & Healthy Fruits': '100% Trái cây tự nhiên',
            'Weekend Special': 'Ưu đãi cuối tuần',
            'Fresh Vegetable & Daily': 'Rau tươi hàng ngày',
            'Get Extra 50% Off': 'Giảm thêm 50%',
            // Section Titles
            'Shop By Categories': 'Mua theo danh mục',
            'Best Value': 'Giá trị tốt nhất',
            'Buy more, Save more': 'Mua nhiều, tiết kiệm nhiều',
            'Fresh Vegetable': 'Rau tươi',
            'Save More!': 'Tiết kiệm hơn!',
            'Organic Vegetable': 'Rau hữu cơ',
            'Hot Deals!': 'Ưu đãi hot!',
            'Deal Of The Day': 'Ưu đãi trong ngày',
            'Our Products': 'Sản phẩm của chúng tôi',
            'Top Selling Items': 'Sản phẩm bán chạy',
            'Trending Products': 'Sản phẩm xu hướng',
            'NEW PRODUCTS': 'SẢN PHẨM MỚI',
            'FEATURE PRODUCT': 'SẢN PHẨM NỔI BẬT',
            'BEST SELLER': 'BÁN CHẠY NHẤT',
            'ON SELL': 'ĐANG GIẢM GIÁ',
            'Sold': 'Đã bán',
            'Items': 'sản phẩm',
            'Hurry up offer end in': 'Nhanh tay, ưu đãi kết thúc sau',
            'View Offer': 'Xem ưu đãi',
            'HOT DEALS': 'ƯU ĐÃI HOT',
            // Product Tabs
            'All': 'Tất cả',
            'Vegetable': 'Rau củ',
            'Fruits': 'Trái cây',
            'Cooking': 'Nấu ăn',
            'Snacks': 'Snack',
            'Add To Cart': 'Thêm vào giỏ',
            'Quick View': 'Xem nhanh',
            'Compare': 'So sánh',
            // Product Names
            'Bell Pepper': 'Ớt chuông',
            'Potato': 'Khoai tây',
            'Baby Chili': 'Ớt baby',
            'Broccoli': 'Bông cải xanh',
            'Peru': 'Lê',
            'Avocado': 'Bơ',
            'Cucumber': 'Dưa leo',
            'Beetroot': 'Củ dền',
            'Strawberry': 'Dâu tây',
            'Corn': 'Bắp ngô',
            'Cabbage': 'Bắp cải',
            'Ginger': 'Gừng',
            'Eggplant': 'Cà tím',
            'Onion': 'Hành tây',
            'Tomato': 'Cà chua',
            'Garlic': 'Tỏi',
            'Carrot': 'Cà rốt',
            'Spinach': 'Rau bina',
            'Lettuce': 'Xà lách',
            'Pumpkin': 'Bí đỏ',
            'Apple': 'Táo',
            'Orange': 'Cam',
            'Banana': 'Chuối',
            'Mango': 'Xoài',
            'Grapes': 'Nho',
            'Watermelon': 'Dưa hấu',
            // Footer
            'About Fastkart': 'Về Fastkart',
            'About Us': 'Về chúng tôi',
            'Contact Us': 'Liên hệ',
            'Terms & Conditions': 'Điều khoản & Điều kiện',
            'Careers': 'Tuyển dụng',
            'Latest Blog': 'Blog mới nhất',
            'Useful Link': 'Liên kết hữu ích',
            'Your Order': 'Đơn hàng của bạn',
            'Your Account': 'Tài khoản của bạn',
            'Track Orders': 'Theo dõi đơn hàng',
            'Your Wishlist': 'Danh sách yêu thích',
            'FAQs': 'Câu hỏi thường gặp',
            'Categories': 'Danh mục',
            'Fresh Vegetables': 'Rau tươi',
            'Hot Spice': 'Gia vị cay',
            'Brand New Bags': 'Túi mới',
            'New Bakery': 'Bánh mới',
            'New Grocery': 'Tạp hóa mới',
            'Store infomation': 'Thông tin cửa hàng',
            'Call us': 'Gọi cho chúng tôi',
            'Email Us': 'Email',
            // Newsletter
            'Subscribe to the newsletter': 'Đăng ký nhận tin',
            'Join our subscribers list to get the latest news, updates and special offers delivered directly in your inbox.': 'Tham gia để nhận tin tức mới nhất, cập nhật và ưu đãi đặc biệt.',
            'Enter your email': 'Nhập email của bạn',
            'Subscribe': 'Đăng ký',
            // Mobile Menu
            'Menu': 'Menu',
            'Category': 'Danh mục',
            'Search': 'Tìm kiếm',
            'My Wish': 'Yêu thích',
            'Cart': 'Giỏ hàng',
            // Notifications
            'langChangeMsg': 'Ngôn ngữ đã được đổi thành: Tiếng Việt',
            'currencyChangeMsg': 'Đơn vị tiền tệ đã được đổi thành'
        },
        'English': {
            currency: 'USD',
            currencySymbol: '$',
            // Header & Navigation
            'All Categories': 'All Categories',
            'Home': 'Home',
            'Shop': 'Shop',
            'Product': 'Product',
            'Mega Menu': 'Mega Menu',
            'Blog': 'Blog',
            'Pages': 'Pages',
            'Seller': 'Seller',
            'Your Location': 'Your Location',
            'Hot Deals': 'Hot Deals',
            'View Cart': 'View Cart',
            'Checkout': 'Checkout',
            'Price': 'Price',
            // Category Slider
            'Oils, Refined & Ghee': 'Oils, Refined & Ghee',
            'Rice, Flour & Grains': 'Rice, Flour & Grains',
            'Food Cupboard': 'Food Cupboard',
            'Dals & Pulses': 'Dals & Pulses',
            'Drinks & Beverages': 'Drinks & Beverages',
            'Fresh Fruits & Vegetables': 'Fresh Fruits & Vegetables',
            'Ready to eat Meals': 'Ready to eat Meals',
            'Vegetables & Fruit': 'Vegetables & Fruit',
            'Beverages': 'Beverages',
            'Beverage': 'Beverage',
            'Meats & Seafood': 'Meats & Seafood',
            'Breakfast & Dairy': 'Breakfast & Dairy',
            'Frozen Foods': 'Frozen Foods',
            'Biscuits & Snacks': 'Biscuits & Snacks',
            'Grocery & Staples': 'Grocery & Staples',
            'Dairy': 'Dairy',
            // Home Section
            'ORGANIC': 'ORGANIC',
            '100% Fresh': '100% Fresh',
            'Fruit & Vegetables': 'Fruit & Vegetables',
            'Fruits & Vegetables': 'Fruits & Vegetables',
            'Free shipping on all your order. we deliver you enjoy': 'Free shipping on all your order. we deliver you enjoy',
            'Shop Now': 'Shop Now',
            'Fresh & 100% Organic': 'Fresh & 100% Organic',
            "farmer's market": "farmer's market",
            'Organic Lifestyle': 'Organic Lifestyle',
            'Best Weekend Sales': 'Best Weekend Sales',
            'Safe food saves lives': 'Safe food saves lives',
            'Discount Offer': 'Discount Offer',
            'AVAILABLE': 'AVAILABLE',
            'PREVIEW': 'PREVIEW',
            '100% Natural & Healthy Fruits': '100% Natural & Healthy Fruits',
            'Weekend Special': 'Weekend Special',
            'Fresh Vegetable & Daily': 'Fresh Vegetable & Daily',
            'Get Extra 50% Off': 'Get Extra 50% Off',
            // Section Titles
            'Shop By Categories': 'Shop By Categories',
            'Best Value': 'Best Value',
            'Buy more, Save more': 'Buy more, Save more',
            'Fresh Vegetable': 'Fresh Vegetable',
            'Save More!': 'Save More!',
            'Organic Vegetable': 'Organic Vegetable',
            'Hot Deals!': 'Hot Deals!',
            'Deal Of The Day': 'Deal Of The Day',
            'Our Products': 'Our Products',
            'Top Selling Items': 'Top Selling Items',
            'Trending Products': 'Trending Products',
            'NEW PRODUCTS': 'NEW PRODUCTS',
            'FEATURE PRODUCT': 'FEATURE PRODUCT',
            'BEST SELLER': 'BEST SELLER',
            'ON SELL': 'ON SELL',
            'Sold': 'Sold',
            'Items': 'Items',
            'Hurry up offer end in': 'Hurry up offer end in',
            'View Offer': 'View Offer',
            'HOT DEALS': 'HOT DEALS',
            // Product Tabs
            'All': 'All',
            'Vegetable': 'Vegetable',
            'Fruits': 'Fruits',
            'Cooking': 'Cooking',
            'Snacks': 'Snacks',
            'Add To Cart': 'Add To Cart',
            'Quick View': 'Quick View',
            'Compare': 'Compare',
            // Product Names
            'Bell Pepper': 'Bell Pepper',
            'Potato': 'Potato',
            'Baby Chili': 'Baby Chili',
            'Broccoli': 'Broccoli',
            'Peru': 'Peru',
            'Avocado': 'Avocado',
            'Cucumber': 'Cucumber',
            'Beetroot': 'Beetroot',
            'Strawberry': 'Strawberry',
            'Corn': 'Corn',
            'Cabbage': 'Cabbage',
            'Ginger': 'Ginger',
            'Eggplant': 'Eggplant',
            'Onion': 'Onion',
            'Tomato': 'Tomato',
            'Garlic': 'Garlic',
            'Carrot': 'Carrot',
            'Spinach': 'Spinach',
            'Lettuce': 'Lettuce',
            'Pumpkin': 'Pumpkin',
            'Apple': 'Apple',
            'Orange': 'Orange',
            'Banana': 'Banana',
            'Mango': 'Mango',
            'Grapes': 'Grapes',
            'Watermelon': 'Watermelon',
            // Footer
            'About Fastkart': 'About Fastkart',
            'About Us': 'About Us',
            'Contact Us': 'Contact Us',
            'Terms & Conditions': 'Terms & Conditions',
            'Careers': 'Careers',
            'Latest Blog': 'Latest Blog',
            'Useful Link': 'Useful Link',
            'Your Order': 'Your Order',
            'Your Account': 'Your Account',
            'Track Orders': 'Track Orders',
            'Your Wishlist': 'Your Wishlist',
            'FAQs': 'FAQs',
            'Categories': 'Categories',
            'Fresh Vegetables': 'Fresh Vegetables',
            'Hot Spice': 'Hot Spice',
            'Brand New Bags': 'Brand New Bags',
            'New Bakery': 'New Bakery',
            'New Grocery': 'New Grocery',
            'Store infomation': 'Store infomation',
            'Call us': 'Call us',
            'Email Us': 'Email Us',
            // Newsletter
            'Subscribe to the newsletter': 'Subscribe to the newsletter',
            'Join our subscribers list to get the latest news, updates and special offers delivered directly in your inbox.': 'Join our subscribers list to get the latest news, updates and special offers delivered directly in your inbox.',
            'Enter your email': 'Enter your email',
            'Subscribe': 'Subscribe',
            // Mobile Menu
            'Menu': 'Menu',
            'Category': 'Category',
            'Search': 'Search',
            'My Wish': 'My Wish',
            'Cart': 'Cart',
            // Notifications
            'langChangeMsg': 'Language changed to: English',
            'currencyChangeMsg': 'Currency changed to'
        }
    };

    // Helper function to translate text
    function translateText(text, dict) {
        const trimmed = text.trim();
        for (const [key, value] of Object.entries(translations['English'])) {
            if (trimmed === key || trimmed === value || trimmed === translations['Vietnamese'][key]) {
                return dict[key] || trimmed;
            }
        }
        return null;
    }

    // Apply translations to the page
    function applyTranslations(lang) {
        const dict = translations[lang];
        if (!dict) return;

        // 1. Category dropdown button
        const catBtn = document.querySelector('.dropdown-category span');
        if (catBtn) catBtn.textContent = dict['All Categories'];

        // 2. Hot Deals button
        const hotDealsBtn = document.querySelector('.fire-button span');
        if (hotDealsBtn) hotDealsBtn.textContent = dict['Hot Deals'];

        // 3. Location text
        const locatName = document.querySelector('.locat-name');
        if (locatName) locatName.textContent = dict['Your Location'];

        // 4. Category slider items
        document.querySelectorAll('.category-box-list h5, .category-name h6').forEach(el => {
            const translated = translateText(el.textContent, dict);
            if (translated) el.textContent = translated;
        });

        // 5. Section titles (h2 in .title)
        document.querySelectorAll('.title h2').forEach(h2 => {
            const translated = translateText(h2.textContent, dict);
            if (translated) h2.textContent = translated;
        });

        // 6. Value offer cards text
        document.querySelectorAll('.offer-box h6, .offer-box span, .offer-detail h6, .offer-detail span').forEach(el => {
            const translated = translateText(el.textContent, dict);
            if (translated) el.textContent = translated;
        });

        // 7. Banner text
        document.querySelectorAll('.home-detail h1, .home-detail h3, .home-detail p, .home-contain h2, .home-contain h3, .home-contain p, .banner-contain h2, .banner-contain h3, .banner-contain span').forEach(el => {
            const translated = translateText(el.textContent, dict);
            if (translated) el.textContent = translated;
        });

        // 8. Buttons
        document.querySelectorAll('.btn-2-animation, .home-button, .btn-category, .offer-button, .shop-button').forEach(btn => {
            const text = btn.textContent.trim();
            if (text.includes('Shop Now') || text.includes('Mua ngay')) btn.textContent = dict['Shop Now'];
            if (text.includes('View Offer') || text.includes('Xem ưu đãi')) btn.textContent = dict['View Offer'];
        });

        // 9. Product tabs
        document.querySelectorAll('.nav-tabs .nav-link, .product-tab-content .nav-link, .tab-list li button').forEach(tab => {
            const translated = translateText(tab.textContent, dict);
            if (translated) tab.textContent = translated;
        });

        // 10. Product names
        document.querySelectorAll('.product-detail h5.name, .product-detail a h5, .product-box-detail h5, .deal-contain h5, .selling-product-box h5').forEach(el => {
            const translated = translateText(el.textContent, dict);
            if (translated) el.textContent = translated;
        });

        // 11. Product labels (HOT DEALS, Sold, Items)
        document.querySelectorAll('.product-label span, .hot-deal, .sold-box span').forEach(el => {
            const translated = translateText(el.textContent, dict);
            if (translated) el.textContent = translated;
        });

        // 12. Category section labels
        document.querySelectorAll('.category-slider .category-title, .category-box h5').forEach(el => {
            const translated = translateText(el.textContent, dict);
            if (translated) el.textContent = translated;
        });

        // 13. Product section titles (NEW PRODUCTS, etc.)
        document.querySelectorAll('.product-title h4, .selling-box h4').forEach(h4 => {
            const translated = translateText(h4.textContent, dict);
            if (translated) h4.textContent = translated;
        });

        // 14. Footer titles
        document.querySelectorAll('.footer-title h4').forEach(h4 => {
            const translated = translateText(h4.textContent, dict);
            if (translated) h4.textContent = translated;
        });

        // 15. Footer links
        document.querySelectorAll('.footer-contain-2, .footer-list a').forEach(link => {
            const text = link.textContent.replace(/[^\w\s&]/g, '').trim();
            const translated = translateText(text, dict);
            if (translated) {
                const icon = link.querySelector('i');
                if (icon) {
                    link.innerHTML = '';
                    link.appendChild(icon);
                    link.appendChild(document.createTextNode(translated));
                } else {
                    link.textContent = translated;
                }
            }
        });

        // 16. Newsletter section
        const newsletterTitle = document.querySelector('.newsletter-detail h2');
        if (newsletterTitle) newsletterTitle.textContent = dict['Subscribe to the newsletter'];

        const newsletterDesc = document.querySelector('.newsletter-detail h4');
        if (newsletterDesc) newsletterDesc.textContent = dict['Join our subscribers list to get the latest news, updates and special offers delivered directly in your inbox.'];

        const newsletterInput = document.querySelector('.newsletter-form input[type="email"]');
        if (newsletterInput) newsletterInput.placeholder = dict['Enter your email'];

        const newsletterBtn = document.querySelector('.newsletter-form .submit-button');
        if (newsletterBtn) newsletterBtn.textContent = dict['Subscribe'];

        // 17. Mobile menu items  
        document.querySelectorAll('.mobile-menu span').forEach(span => {
            const translated = translateText(span.textContent, dict);
            if (translated) span.textContent = translated;
        });

        // 18. Cart popup buttons
        document.querySelectorAll('.cart-button a, .view-cart-btn, .checkout-btn').forEach(btn => {
            const text = btn.textContent.trim();
            if (text === 'View Cart' || text === 'Xem giỏ') btn.textContent = dict['View Cart'];
            if (text === 'Checkout' || text === 'Thanh toán') btn.textContent = dict['Checkout'];
        });

        // 19. ORGANIC label
        document.querySelectorAll('.ls-expanded, .organic-label').forEach(el => {
            if (el.textContent.trim() === 'ORGANIC' || el.textContent.trim() === 'HỮU CƠ') {
                el.textContent = dict['ORGANIC'];
            }
        });

        // 20. Banner labels (AVAILABLE, PREVIEW)
        document.querySelectorAll('.banner-label, .home-wrap span').forEach(el => {
            const translated = translateText(el.textContent, dict);
            if (translated) el.textContent = translated;
        });

        console.log('Full translations applied for:', lang);
    }

    // Wait for DOM ready
    function init() {
        const langText = document.getElementById('langText');
        const currencyText = document.getElementById('currencyText');
        const langItems = document.querySelectorAll('#dropdownMenuButton1 + .dropdown-menu .dropdown-item');
        const currencyItems = document.querySelectorAll('#dropdownMenuButton2 + .dropdown-menu .dropdown-item');

        // Load saved language or use default
        const savedLang = localStorage.getItem('selectedLanguage') || 'Vietnamese';
        const savedCurrency = localStorage.getItem('selectedCurrency') || 'VND';

        if (langText) langText.textContent = savedLang;
        if (currencyText) currencyText.textContent = savedCurrency;

        // Apply translations on page load
        setTimeout(() => applyTranslations(savedLang), 300);
        setTimeout(() => applyTranslations(savedLang), 1000);

        // Language change handler
        langItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const selectedLang = this.textContent.trim();
                const dict = translations[selectedLang];

                if (langText && dict) {
                    langText.textContent = selectedLang;
                    localStorage.setItem('selectedLanguage', selectedLang);

                    if (currencyText) {
                        currencyText.textContent = dict.currency;
                        localStorage.setItem('selectedCurrency', dict.currency);
                    }

                    applyTranslations(selectedLang);

                    if (typeof $.notify === 'function') {
                        $.notify({ message: dict['langChangeMsg'] }, { type: 'success', delay: 2000 });
                    }
                }
            });
        });

        // Currency change handler  
        currencyItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const selectedCurrency = this.textContent.trim();
                const currentLang = localStorage.getItem('selectedLanguage') || 'Vietnamese';
                const dict = translations[currentLang];

                if (currencyText) {
                    currencyText.textContent = selectedCurrency;
                    localStorage.setItem('selectedCurrency', selectedCurrency);

                    if (typeof $.notify === 'function') {
                        $.notify({ message: dict['currencyChangeMsg'] + ': ' + selectedCurrency }, { type: 'success', delay: 2000 });
                    }
                }
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
