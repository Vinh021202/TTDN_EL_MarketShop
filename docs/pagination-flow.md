# So do hoat dong phan trang

Tai lieu nay mo ta luong phan trang dang duoc dung trong frontend client va backend server cua du an.

## 1. Luong tong quat

```mermaid
flowchart TD
    A["Nguoi dung mo trang danh sach"] --> B["Client doc state hien tai<br/>page / search / filter / limit"]
    B --> C{"Nguoi dung vua doi<br/>search hoac filter?"}
    C -- "Co" --> D["Reset page = 1"]
    C -- "Khong" --> E["Giu page hien tai<br/>hoac tang/giam page"]
    D --> F["Goi API danh sach<br/>kem page + limit + filter"]
    E --> F

    F --> G["Server parse page, limit"]
    G --> H["Tinh skip = (page - 1) * limit"]
    H --> I["Tao filter / search / sort query"]
    I --> J["Query du lieu:<br/>find(...).skip(skip).limit(limit)"]
    I --> K["Dem tong ban ghi:<br/>countDocuments(filter)"]

    J --> L["Server tinh totalPages = ceil(total / limit)"]
    K --> L
    L --> M["Tra ve JSON:<br/>items + pagination"]

    M --> N["Client cap nhat state / React Query data"]
    N --> O["Render danh sach item"]
    N --> P["Render dieu huong phan trang"]

    P --> Q{"totalPages > 1?"}
    Q -- "Co" --> R["Hien thi nut Truoc / Sau<br/>hoac danh sach so trang"]
    Q -- "Khong" --> S["An dieu huong phan trang"]

    R --> T{"Nguoi dung bam doi trang?"}
    T -- "Co" --> U["Cap nhat page moi"]
    U --> F
    T -- "Khong" --> V["Giu nguyen ket qua hien tai"]
```

## 2. Luong theo tung khu vuc

### 2.1 Storefront san pham

```mermaid
flowchart LR
    A["ProductListPage"] --> B["Doc searchParams<br/>page, search, category"]
    B --> C["getProducts({ page, limit: 12, search, category })"]
    C --> D["GET /api/products"]
    D --> E["product.controller.ts"]
    E --> F["parseInt(page, limit)"]
    F --> G["skip = (page - 1) * limit"]
    G --> H["Product.find(filter).sort(...).skip(skip).limit(limit)"]
    H --> I["countDocuments(filter)"]
    I --> J["Tra products + pagination"]
    J --> K["Render card san pham"]
    J --> L["Render nut Truoc / Sau"]
```

### 2.2 Storefront cong thuc

```mermaid
flowchart LR
    A["RecipesPage"] --> B["State noi bo<br/>page, mood, search, maxTime"]
    B --> C{"Doi filter hoac search?"}
    C -- "Co" --> D["setPage(1)"]
    C -- "Khong" --> E["Giu page hien tai"]
    D --> F["getRecipes({ page, limit: 12, mood, q, maxTime })"]
    E --> F
    F --> G["GET /api/recipes"]
    G --> H["recipe.controller.ts"]
    H --> I["parse page / limit / skip"]
    I --> J["Recipe.find(...).skip(skip).limit(limit)"]
    J --> K["countDocuments(filter)"]
    K --> L["Tra recipes + pagination"]
    L --> M["Render grid recipe"]
    L --> N["Render danh sach so trang"]
```

### 2.3 Dashboard admin

```mermaid
flowchart LR
    A["AdminProductsPage / AdminOrdersPage / AdminUsersPage / AdminRecipesPage"] --> B["State page + search + filter"]
    B --> C["adminApi gui page / limit / search"]
    C --> D["API admin tuong ung"]
    D --> E["Server parse page / limit / skip"]
    E --> F["Query du lieu + countDocuments"]
    F --> G["Tra data + pagination"]
    G --> H["Render bang du lieu"]
    H --> I["Render nut Truoc / Sau"]
    I --> J["Nguoi dung doi trang"]
    J --> C
```

## 3. Du lieu phan trang tra ve tu backend

Backend dang thong nhat tra metadata theo dang:

```json
{
  "pagination": {
    "total": 120,
    "page": 2,
    "limit": 12,
    "totalPages": 10
  }
}
```

Y nghia:

- total: tong so ban ghi sau khi ap dung filter
- page: trang hien tai
- limit: so phan tu tren moi trang
- totalPages: tong so trang co the hien thi

## 4. Quy tac hoat dong dang ap dung

- Khi nguoi dung doi search hoac filter, frontend se reset ve page = 1.
- Khi nguoi dung bam Truoc, Sau hoac so trang, frontend chi doi page.
- Backend luon tinh skip = (page - 1) * limit.
- Backend query du lieu trang hien tai va dem tong so ban ghi rieng biet.
- Frontend chi hien thi dieu huong phan trang khi totalPages > 1.

## 5. File dang tham gia vao luong phan trang

Frontend:

- client/src/features/products/ProductListPage.tsx
- client/src/features/recipes/RecipesPage.tsx
- client/src/features/admin/AdminProductsPage.tsx
- client/src/features/admin/AdminOrdersPage.tsx
- client/src/features/admin/AdminUsersPage.tsx
- client/src/features/admin/AdminRecipesPage.tsx
- client/src/features/products/services/productsApi.ts
- client/src/features/admin/services/adminApi.ts

Backend:

- server/src/controllers/product.controller.ts
- server/src/controllers/recipe.controller.ts
- server/src/controllers/admin.controller.ts
- server/src/controllers/adminRecipe.controller.ts
