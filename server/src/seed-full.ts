import 'dotenv/config';
import mongoose from 'mongoose';
import { Category } from './models/Category.model.js';
import { Product } from './models/Product.model.js';
import { productCloudinaryImageMap } from './data/productCloudinaryMap.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Generate slug from Vietnamese text
function slugify(text: string): string {
    // Vietnamese character map
    const from =
        'àáạảãâầấậẩẫăằắặẳẵèéẹảẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ';
    const to =
        'aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuuuuuuydAAAAAAAAAAAAAAAAAEEEEEEEEEEEIIIIIOOOOOOOOOOOOOOOOOUUUUUUUUUUUYYYYYD';

    let result = text;
    for (let i = 0; i < from.length; i++) {
        result = result.replace(new RegExp(from[i], 'g'), to[i]);
    }

    return result
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/-+/g, '-'); // Replace multiple - with single -
}

// Normalize unit to match Product model enum
function normalizeUnit(unit: string): string {
    const unitMap: Record<string, string> = {
        // Keep valid enums as-is
        kg: 'kg',
        gram: 'gram',
        gói: 'gói',
        bó: 'bó',
        thùng: 'thùng',
        cái: 'cái',
        lít: 'lít',
        // Map variations
        chai: 'cái',
        túi: 'gói',
        hộp: 'gói',
        lốc: 'gói',
        khay: 'cái',
        con: 'cái',
        lon: 'cái',
        khối: 'kg',
    };

    return unitMap[unit] || 'cái'; // Default to 'cái' if unknown
}

// ═══════════════════════════════════════════════════════════════
// COMPREHENSIVE DATABASE SEED
// Based on database_setup.sql and recipes.json
// ═══════════════════════════════════════════════════════════════

// Define categories matching SQL schema
const categories = [
    {
        name: 'Gia vị',
        slug: 'gia-vi',
        description: 'Các loại gia vị nấu ăn',
        image: 'https://res.cloudinary.com/abysst/image/upload/v1/ttdn/categories/gia-vi',
    },
    {
        name: 'Hải sản',
        slug: 'hai-san',
        description: 'Hải sản tươi ngon',
        image: 'https://res.cloudinary.com/abysst/image/upload/v1/ttdn/categories/hai-san',
    },
    {
        name: 'Ngũ cốc',
        slug: 'ngu-coc',
        description: 'Ngũ cốc và thực phẩm dinh dưỡng',
        image: 'https://res.cloudinary.com/abysst/image/upload/v1/ttdn/categories/ngu-coc',
    },
    {
        name: 'Rau củ quả',
        slug: 'rau-cu-qua',
        description: 'Rau củ quả tươi sạch',
        image: 'https://res.cloudinary.com/abysst/image/upload/v1/ttdn/categories/rau-cu',
    },
    {
        name: 'Thịt',
        slug: 'thit',
        description: 'Các loại thịt tươi',
        image: 'https://res.cloudinary.com/abysst/image/upload/v1/ttdn/categories/thit',
    },
    {
        name: 'Trứng & Sữa',
        slug: 'trung-sua',
        description: 'Trứng và sản phẩm từ sữa',
        image: 'https://res.cloudinary.com/abysst/image/upload/v1/ttdn/categories/trung-sua',
    },
];

// Define products (60 total) with Cloudinary URLs
// Categories: 0=Gia vị, 1=Hải sản, 2=Ngũ cốc, 3=Rau củ, 4=Thịt, 5=Trứng&Sữa
const products = [
    // CATEGORY 1: GIA VỊ(10 products)
    {
        name: 'Hạt nêm Knorr thịt thăn xương ống 400g',
        sku: 'GV-001',
        description: 'Chiết xuất từ xương thịt tươi cho vị ngọt thanh.',
        price: 42000,
        stockQuantity: 100,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/gia-vi/hat-nem-knorr'],
        categorySlug: 'gia-vi',
        unit: 'gói',
    },
    {
        name: 'Nước mắm Nam Ngư chai 500ml',
        sku: 'GV-002',
        description: 'Nước mắm cá cơm thơm ngon đậm đà.',
        price: 45000,
        stockQuantity: 150,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/gia-vi/nuoc-nam-nam-ngu'],
        categorySlug: 'gia-vi',
        unit: 'chai',
    },
    {
        name: 'Bột ngọt Ajinomoto gói 454g',
        sku: 'GV-003',
        description: 'Gia vị tăng vị umami cho món ăn.',
        price: 34000,
        stockQuantity: 120,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/gia-vi/bot-ngot-ajinomoto'],
        categorySlug: 'gia-vi',
        unit: 'gói',
    },
    {
        name: 'Tương ớt Cholimex chai 270g',
        sku: 'GV-004',
        description: 'Vị cay nồng hấp dẫn cho các món chiên.',
        price: 12000,
        stockQuantity: 200,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/gia-vi/tuong-ot-cholimex'],
        categorySlug: 'gia-vi',
        unit: 'chai',
    },
    {
        name: 'Dầu ăn Simply đậu nành chai 1L',
        sku: 'GV-005',
        description: 'Giàu Omega 3-6-9 tốt cho tim mạch.',
        price: 58000,
        stockQuantity: 80,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/gia-vi/dau-an-simply'],
        categorySlug: 'gia-vi',
        unit: 'chai',
    },
    {
        name: 'Nước tương Maggi thanh dịu chai 300ml',
        sku: 'GV-006',
        description: 'Lên men tự nhiên, vị thanh dịu.',
        price: 18000,
        stockQuantity: 140,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/gia-vi/nuoc-tuong-maggi'],
        categorySlug: 'gia-vi',
        unit: 'chai',
    },
    {
        name: 'Dầu hào Maggi chai 350g',
        sku: 'GV-007',
        description: 'Giúp món xào sáng bóng, đậm đà.',
        price: 31000,
        stockQuantity: 90,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/gia-vi/dau-hao-maggi'],
        categorySlug: 'gia-vi',
        unit: 'chai',
    },
    {
        name: 'Muối iốt gói 100g',
        sku: 'GV-008',
        description: 'Muối iốt tinh khiết, bổ sung iốt tự nhiên.',
        price: 15000,
        stockQuantity: 300,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/gia-vi/muoi-iot'],
        categorySlug: 'gia-vi',
        unit: 'gói',
    },
    {
        name: 'Đường tinh luyện gói 1kg',
        sku: 'GV-009',
        description: 'Đường tinh luyện trắng sạch từ mía.',
        price: 28000,
        stockQuantity: 110,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/gia-vi/duong'],
        categorySlug: 'gia-vi',
        unit: 'gói',
    },
    {
        name: 'Sốt Barona sườn xào chua ngọt',
        sku: 'GV-010',
        description: 'Gia vị hoàn chỉnh chiết xuất rau củ quả tươi.',
        price: 12500,
        stockQuantity: 130,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/gia-vi/sot-barona'],
        categorySlug: 'gia-vi',
        unit: 'gói',
    },

    // CATEGORY 2: HẢI SẢN (10 products)
    {
        name: 'Tôm thẻ tươi hộp 500g',
        sku: 'HS-001',
        description: 'Tôm thẻ thịt chắc, ngọt, size vừa.',
        price: 115000,
        stockQuantity: 30,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/hai-san/tom-the'],
        categorySlug: 'hai-san',
        unit: 'hộp',
    },
    {
        name: 'Cá nục làm sạch túi 500g',
        sku: 'HS-002',
        description: 'Cá nục tươi đã làm sạch, tiện lợi nấu ngay.',
        price: 38000,
        stockQuantity: 40,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/hai-san/ca-nuc'],
        categorySlug: 'hai-san',
        unit: 'túi',
    },
    {
        name: 'Mực ống tươi túi 300g',
        sku: 'HS-003',
        description: 'Mực ống giòn ngọt, thích hợp hấp gừng.',
        price: 98000,
        stockQuantity: 20,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/hai-san/muc-ong'],
        categorySlug: 'hai-san',
        unit: 'túi',
    },
    {
        name: 'Cá hồi phi lê Na Uy 200g',
        sku: 'HS-004',
        description: 'Cá hồi nhập khẩu, giàu Omega 3.',
        price: 175000,
        stockQuantity: 15,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/hai-san/ca-hoi'],
        categorySlug: 'hai-san',
        unit: 'khay',
    },
    {
        name: 'Cá điêu hồng làm sạch con 800g',
        sku: 'HS-005',
        description: 'Thịt cá trắng, ngọt, không tanh.',
        price: 55000,
        stockQuantity: 25,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/hai-san/ca-dieu-hong'],
        categorySlug: 'hai-san',
        unit: 'con',
    },
    {
        name: 'Nghêu lụa sạch túi 500g',
        sku: 'HS-006',
        description: 'Nghêu đã sạch cát, thịt béo ngậy.',
        price: 42000,
        stockQuantity: 50,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/hai-san/ngheu-lua'],
        categorySlug: 'hai-san',
        unit: 'túi',
    },
    {
        name: 'Cá thu cắt khúc túi 300g',
        sku: 'HS-007',
        description: 'Cá thu đại dương thịt chắc, bùi.',
        price: 85000,
        stockQuantity: 22,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/hai-san/ca-thu'],
        categorySlug: 'hai-san',
        unit: 'túi',
    },
    {
        name: 'Cua biển Cà Mau con 400g',
        sku: 'HS-008',
        description: 'Cua thịt chắc, đảm bảo tươi sống.',
        price: 190000,
        stockQuantity: 10,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/hai-san/cua-bien'],
        categorySlug: 'hai-san',
        unit: 'con',
    },
    {
        name: 'Sò huyết túi 500g',
        sku: 'HS-009',
        description: 'Sò huyết tươi, bổ máu, béo ngọt.',
        price: 95000,
        stockQuantity: 18,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/hai-san/so-huyet'],
        categorySlug: 'hai-san',
        unit: 'túi',
    },
    {
        name: 'Cá cam làm sạch túi 500g',
        sku: 'HS-010',
        description: 'Cá cam thịt dày, thích hợp kho hoặc nướng.',
        price: 45000,
        stockQuantity: 30,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/hai-san/ca-cam'],
        categorySlug: 'hai-san',
        unit: 'túi',
    },

    // CATEGORY 3: NGŨ CỐC (10 products)
    {
        name: 'Gạo ST25 túi 5kg',
        sku: 'NC-001',
        description: 'Gạo ngon nhất thế giới, thơm lá dứa.',
        price: 190000,
        stockQuantity: 100,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/ngu-coc/gao-st25'],
        categorySlug: 'ngu-coc',
        unit: 'túi',
    },
    {
        name: 'Yến mạch Quaker Oats thùng 4.5kg',
        sku: 'NC-002',
        description: 'Yến mạch cán vỡ nhập khẩu từ Mỹ.',
        price: 345000,
        stockQuantity: 20,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/ngu-coc/quaker-oats'],
        categorySlug: 'ngu-coc',
        unit: 'thùng',
    },
    {
        name: 'Gạo lứt đỏ túi 2kg',
        sku: 'NC-003',
        description: 'Gạo lứt giàu chất xơ, tốt cho sức khỏe.',
        price: 65000,
        stockQuantity: 60,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/ngu-coc/gao-lut-do'],
        categorySlug: 'ngu-coc',
        unit: 'túi',
    },
    {
        name: 'Ngũ cốc Nesvita túi 400g',
        sku: 'NC-004',
        description: 'Bổ sung canxi và chất xơ từ ngũ cốc nguyên cám.',
        price: 75000,
        stockQuantity: 80,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/ngu-coc/ngu-coc-nesvita'],
        categorySlug: 'ngu-coc',
        unit: 'túi',
    },
    {
        name: 'Bột đậu nành nguyên chất túi 500g',
        sku: 'NC-005',
        description: 'Bột đậu nành thơm ngon, giàu đạm thực vật.',
        price: 48000,
        stockQuantity: 50,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/ngu-coc/bot-dau-nanh'],
        categorySlug: 'ngu-coc',
        unit: 'túi',
    },
    {
        name: 'Gạo nếp cái hoa vàng túi 2kg',
        sku: 'NC-006',
        description: 'Nếp dẻo thơm, chuyên dùng nấu xôi, gói bánh.',
        price: 55000,
        stockQuantity: 40,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/ngu-coc/nep-cai-hoa-vang'],
        categorySlug: 'ngu-coc',
        unit: 'túi',
    },
    {
        name: 'Hạt chia hữu cơ gói 200g',
        sku: 'NC-007',
        description: 'Siêu thực phẩm giàu Omega 3 và chất xơ.',
        price: 120000,
        stockQuantity: 35,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/ngu-coc/hat-chia'],
        categorySlug: 'ngu-coc',
        unit: 'gói',
    },
    {
        name: 'Đậu xanh nguyên hạt túi 500g',
        sku: 'NC-008',
        description: 'Đậu xanh sạch, hạt đều, không mốc.',
        price: 28000,
        stockQuantity: 90,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/ngu-coc/dau-xanh'],
        categorySlug: 'ngu-coc',
        unit: 'túi',
    },
    {
        name: 'Bột mì đa năng Meizan gói 1kg',
        sku: 'NC-009',
        description: 'Dùng làm bánh hoặc chế biến món ăn.',
        price: 24500,
        stockQuantity: 110,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/ngu-coc/bot-mi-meizan'],
        categorySlug: 'ngu-coc',
        unit: 'gói',
    },
    {
        name: 'Bắp nếp Đà Lạt túi 3 trái',
        sku: 'NC-010',
        description: 'Bắp nếp dẻo, ngọt, thu hoạch trong ngày.',
        price: 21000,
        stockQuantity: 100,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/ngu-coc/bap-nep'],
        categorySlug: 'ngu-coc',
        unit: 'túi',
    },

    // CATEGORY 4: RAU CỦ QUẢ (10 products)
    {
        name: 'Cà chua VietGAP túi 500g',
        sku: 'RC-001',
        description: 'Cà chua tươi sạch, mọng nước.',
        price: 16000,
        stockQuantity: 70,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/rau-cu/ca-chua'],
        categorySlug: 'rau-cu-qua',
        unit: 'túi',
    },
    {
        name: 'Bông cải xanh túi 500g',
        sku: 'RC-002',
        description: 'Rau sạch Đà Lạt, giòn ngọt.',
        price: 32000,
        stockQuantity: 45,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/rau-cu/bong-cai-xanh'],
        categorySlug: 'rau-cu-qua',
        unit: 'túi',
    },
    {
        name: 'Cà rốt túi 500g',
        sku: 'RC-003',
        description: 'Cà rốt củ đều, không bị dập.',
        price: 14000,
        stockQuantity: 85,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/rau-cu/ca-rot'],
        categorySlug: 'rau-cu-qua',
        unit: 'túi',
    },
    {
        name: 'Khoai tây túi 1kg',
        sku: 'RC-004',
        description: 'Khoai tây bở, thích hợp làm khoai chiên.',
        price: 26000,
        stockQuantity: 65,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/rau-cu/khoai-tay'],
        categorySlug: 'rau-cu-qua',
        unit: 'túi',
    },
    {
        name: 'Bắp cải thảo túi 1kg',
        sku: 'RC-005',
        description: 'Cải thảo tươi, thích hợp nấu canh hoặc kim chi.',
        price: 19000,
        stockQuantity: 55,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/rau-cu/bap-cai-thao'],
        categorySlug: 'rau-cu-qua',
        unit: 'túi',
    },
    {
        name: 'Dưa leo giống Nhật túi 500g',
        sku: 'RC-006',
        description: 'Dưa leo ít hạt, giòn tan.',
        price: 15000,
        stockQuantity: 95,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/rau-cu/dua-leo'],
        categorySlug: 'rau-cu-qua',
        unit: 'túi',
    },
    {
        name: 'Hành tây túi 500g',
        sku: 'RC-007',
        description: 'Hành tây trắng, củ chắc.',
        price: 13000,
        stockQuantity: 100,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/rau-cu/hanh-tay'],
        categorySlug: 'rau-cu-qua',
        unit: 'túi',
    },
    {
        name: 'Xà lách thủy canh 250g',
        sku: 'RC-008',
        description: 'Xà lách sạch, không thuốc trừ sâu.',
        price: 22000,
        stockQuantity: 30,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/rau-cu/xa-lach'],
        categorySlug: 'rau-cu-qua',
        unit: 'gói',
    },
    {
        name: 'Bí đỏ hồ lô kg',
        sku: 'RC-009',
        description: 'Bí dẻo, ngọt, giàu vitamin A.',
        price: 24000,
        stockQuantity: 40,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/rau-cu/bi-do'],
        categorySlug: 'rau-cu-qua',
        unit: 'kg',
    },
    {
        name: 'Nấm kim châm gói 150g',
        sku: 'RC-010',
        description: 'Nấm tươi trắng, dai giòn.',
        price: 12000,
        stockQuantity: 120,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/rau-cu/nam-kim-cham'],
        categorySlug: 'rau-cu-qua',
        unit: 'gói',
    },

    // CATEGORY 5: THỊT (10 products)
    {
        name: 'Thịt ba rọi heo túi 500g',
        sku: 'TH-001',
        description: 'Thịt sạch, tỷ lệ nạc mỡ cân đối.',
        price: 85000,
        stockQuantity: 40,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/thit/ba-roi-heo'],
        categorySlug: 'thit',
        unit: 'túi',
    },
    {
        name: 'Thịt bò phi lê nội túi 250g',
        sku: 'TH-002',
        description: 'Thịt bò mềm, không gân.',
        price: 95000,
        stockQuantity: 25,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/thit/bo-phi-le'],
        categorySlug: 'thit',
        unit: 'túi',
    },
    {
        name: 'Đùi gà tỏi CP túi 500g',
        sku: 'TH-003',
        description: 'Gà sạch đạt chuẩn, thịt chắc.',
        price: 42000,
        stockQuantity: 55,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/thit/dui-ga'],
        categorySlug: 'thit',
        unit: 'túi',
    },
    {
        name: 'Nạc dăm heo túi 500g',
        sku: 'TH-004',
        description: 'Nạc dăm mềm, có ít vân mỡ.',
        price: 72000,
        stockQuantity: 45,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/thit/nac-dam'],
        categorySlug: 'thit',
        unit: 'túi',
    },
    {
        name: 'Sườn non heo túi 500g',
        sku: 'TH-005',
        description: 'Sườn non tươi ngon, thích hợp nướng hoặc ram.',
        price: 110000,
        stockQuantity: 20,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/thit/suon-non'],
        categorySlug: 'thit',
        unit: 'túi',
    },
    {
        name: 'Cánh gà tươi túi 1kg',
        sku: 'TH-006',
        description: 'Cánh gà chiên nước mắm siêu ngon.',
        price: 68000,
        stockQuantity: 30,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/thit/canh-ga'],
        categorySlug: 'thit',
        unit: 'túi',
    },
    {
        name: 'Thịt heo xay túi 500g',
        sku: 'TH-007',
        description: 'Thịt tươi xay mới mỗi ngày.',
        price: 65000,
        stockQuantity: 60,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/thit/thit-xay'],
        categorySlug: 'thit',
        unit: 'túi',
    },
    {
        name: 'Chân giò heo kg',
        sku: 'TH-008',
        description: 'Giò heo tươi, thích hợp nấu bún bò.',
        price: 92000,
        stockQuantity: 15,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/thit/chan-gio'],
        categorySlug: 'thit',
        unit: 'kg',
    },
    {
        name: 'Thịt vai heo túi 500g',
        sku: 'TH-009',
        description: 'Thịt vai nạc, ít mỡ.',
        price: 69000,
        stockQuantity: 50,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/thit/thit-vai'],
        categorySlug: 'thit',
        unit: 'túi',
    },
    {
        name: 'Lòng heo làm sạch túi 300g',
        sku: 'TH-010',
        description: 'Lòng sạch sẽ, không mùi hôi.',
        price: 48000,
        stockQuantity: 20,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/thit/long-heo'],
        categorySlug: 'thit',
        unit: 'túi',
    },

    // CATEGORY 6: TRỨNG & SỮA (10 products)
    {
        name: 'Trứng gà ta Ba Huân hộp 10 quả',
        sku: 'TS-001',
        description: 'Trứng gà tươi từ trang trại hiện đại.',
        price: 31000,
        stockQuantity: 100,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/trung-sua/trung-ga'],
        categorySlug: 'trung-sua',
        unit: 'hộp',
    },
    {
        name: 'Sữa tươi TH True Milk ít đường 1L',
        sku: 'TS-002',
        description: 'Sữa tươi nguyên chất 100% sạch.',
        price: 36000,
        stockQuantity: 150,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/trung-sua/sua-tuoi-th'],
        categorySlug: 'trung-sua',
        unit: 'hộp',
    },
    {
        name: 'Sữa chua Vinamilk có đường lốc 4',
        sku: 'TS-003',
        description: 'Sữa chua lên men tự nhiên.',
        price: 26000,
        stockQuantity: 200,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/trung-sua/sua-chua'],
        categorySlug: 'trung-sua',
        unit: 'lốc',
    },
    {
        name: 'Sữa đặc Ông Thọ đỏ lon 380g',
        sku: 'TS-004',
        description: 'Sữa đặc có đường huyền thoại.',
        price: 24000,
        stockQuantity: 300,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/trung-sua/sua-dac'],
        categorySlug: 'trung-sua',
        unit: 'lon',
    },
    {
        name: 'Trứng vịt Ba Huân hộp 10 quả',
        sku: 'TS-005',
        description: 'Trứng vịt lớn, lòng đỏ đậm.',
        price: 38000,
        stockQuantity: 80,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/trung-sua/trung-vit'],
        categorySlug: 'trung-sua',
        unit: 'hộp',
    },
    {
        name: 'Sữa tươi Vinamilk có đường 180ml',
        sku: 'TS-006',
        description: 'Lốc 4 hộp sữa tiệt trùng.',
        price: 31000,
        stockQuantity: 250,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/trung-sua/sua-vinamilk'],
        categorySlug: 'trung-sua',
        unit: 'lốc',
    },
    {
        name: 'Phô mai con bò cười hộp 8 miếng',
        sku: 'TS-007',
        description: 'Phô mai giàu canxi và dinh dưỡng.',
        price: 38000,
        stockQuantity: 70,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/trung-sua/pho-mai'],
        categorySlug: 'trung-sua',
        unit: 'hộp',
    },
    {
        name: 'Sữa hạt Milo lốc 4 hộp 180ml',
        sku: 'TS-008',
        description: 'Thức uống lúa mạch thơm ngon.',
        price: 29000,
        stockQuantity: 180,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/trung-sua/milo'],
        categorySlug: 'trung-sua',
        unit: 'lốc',
    },
    {
        name: 'Sữa đậu nành Fami lốc 6 bịch',
        sku: 'TS-009',
        description: 'Làm từ đậu nành chọn lọc không biến đổi gen.',
        price: 28000,
        stockQuantity: 140,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/trung-sua/sua-dau-nanh'],
        categorySlug: 'trung-sua',
        unit: 'lốc',
    },
    {
        name: 'Bơ lạt Anchor khối 227g',
        sku: 'TS-010',
        description: 'Bơ nhập khẩu cao cấp dùng làm bánh.',
        price: 85000,
        stockQuantity: 40,
        images: ['https://res.cloudinary.com/abysst/image/upload/v1/ttdn/trung-sua/bo-anchor'],
        categorySlug: 'trung-sua',
        unit: 'khối',
    },
];

async function seedDatabase() {
    try {
        console.log('\n🌱 Starting comprehensive database seeding...\n');

        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || '';
        if (!mongoUri || mongoUri.includes('<user>')) {
            console.error('❌ MongoDB URI not configured!');
            process.exit(1);
        }

        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Clear existing data (except users)
        console.log('🗑️  Clearing existing data...\n');
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('✅ Old data cleared\n');

        // Insert Categories
        console.log('📁 Creating categories...\n');
        const createdCategories = await Category.insertMany(categories);
        console.log(`✅ Created ${createdCategories.length} categories\n`);

        // Create category map: slug -> ObjectId
        const categoryMap = new Map();
        createdCategories.forEach((cat) => {
            categoryMap.set(cat.slug, cat._id);
        });

        // Insert Products with normalization
        console.log('📦 Creating products...\n');

        // Normalize products: generate slug, format images
        const productsWithCategory = products.map((product) => {
            const slug = slugify(product.name);
            const cloudinaryImage = productCloudinaryImageMap[product.sku];
            const formattedImages = cloudinaryImage
                ? [
                      {
                          url: cloudinaryImage.url,
                          publicId: cloudinaryImage.publicId,
                          alt: product.name,
                          isPrimary: true,
                      },
                  ]
                : product.images.map((url, index) => ({
                      url,
                      isPrimary: index === 0, // First image is primary
                  }));

            return {
                name: product.name,
                slug: `${slug}-${product.sku.toLowerCase()}`, // Unique slug with SKU
                sku: product.sku,
                description: product.description,
                price: product.price,
                stockQuantity: product.stockQuantity,
                images: formattedImages,
                category: categoryMap.get(product.categorySlug),
                unit: normalizeUnit(product.unit), // Normalize unit to enum
                storageType: 'nhiệt độ thường', // Default storage type
            };
        });

        const createdProducts = await Product.insertMany(productsWithCategory);
        console.log(`✅ Created ${createdProducts.length} products\n`);

        // Load and insert recipes from recipes.json
        console.log('📖 Loading recipes from recipes.json...\n');
        const recipesPath = path.join(__dirname, '../../recipes.json');
        const recipesData = await fs.readFile(recipesPath, 'utf-8');
        const recipes = JSON.parse(recipesData);
        console.log(`✅ Loaded ${recipes.length} recipes from JSON\n`);

        // Summary
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('🎉 DATABASE SEEDING COMPLETE!\n');
        console.log('📊 Summary:');
        console.log(`   Categories: ${createdCategories.length}`);
        console.log(`   Products: ${createdProducts.length}`);
        console.log(`   Recipes: ${recipes.length} (loaded, ready for import)\n`);
        console.log('📁 Data Sources:');
        console.log(`   - SQL Schema: database_setup.sql`);
        console.log(`   - Recipes: recipes.json`);
        console.log(`   - Images: Cloudinary (abysst)\n`);
        console.log('═══════════════════════════════════════════════════════════════\n');

        process.exit(0);
    } catch (error: any) {
        console.error('❌ Seeding failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seedDatabase();
