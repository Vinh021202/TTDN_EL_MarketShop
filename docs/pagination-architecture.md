# Pagination Architecture Diagram

This diagram follows the same block-style structure as the reference image and maps directly to the pagination flow used in this project.

```mermaid
flowchart TB
    subgraph TopRow[" "]
        Converter["PaginationParameterConverter<br/>ProductListPage / RecipesPage / Admin pages<br/>URLSearchParams or local state -> request params"]
    end

    subgraph MiddleRow[" "]
        Parameter["PaginationParameter<br/>page, limit, search, category,<br/>mood, maxTime, status, role"]
        Service["PaginationQueryService<br/>productsApi / recipeApi / adminApi"]
        Filter["PaginationFilter<br/>query filter + search + sort rules"]
    end

    subgraph LowerRow[" "]
        Repository["PaginationRepository<br/>Express controller + Mongoose query<br/>find(...).skip(skip).limit(limit)"]
    end

    Database[("Database<br/>MongoDB")]

    Converter --> Parameter
    Service --> Converter
    Service --> Parameter
    Service --> Filter
    Service --> Repository
    Parameter --> Repository
    Filter --> Repository
    Repository --> Parameter
    Repository --> Filter
    Repository --> Database
```

## Mapping To Current Project

- `PaginationParameterConverter`
  - `client/src/features/products/ProductListPage.tsx`
  - `client/src/features/recipes/RecipesPage.tsx`
  - `client/src/features/admin/AdminProductsPage.tsx`
  - `client/src/features/admin/AdminOrdersPage.tsx`
  - `client/src/features/admin/AdminUsersPage.tsx`
  - `client/src/features/admin/AdminRecipesPage.tsx`

- `PaginationParameter`
  - `page`
  - `limit`
  - `search`
  - `category`
  - `mood`
  - `maxTime`
  - `status`
  - `role`

- `PaginationQueryService`
  - `client/src/features/products/services/productsApi.ts`
  - `client/src/features/recipes/services/recipeApi.ts`
  - `client/src/features/admin/services/adminApi.ts`

- `PaginationFilter`
  - Built inside:
    - `server/src/controllers/product.controller.ts`
    - `server/src/controllers/recipe.controller.ts`
    - `server/src/controllers/admin.controller.ts`
    - `server/src/controllers/adminRecipe.controller.ts`

- `PaginationRepository`
  - Mongoose queries using:
    - `.find(filter)`
    - `.sort(...)`
    - `.skip((page - 1) * limit)`
    - `.limit(limit)`
    - `.countDocuments(filter)`

- `Database`
  - MongoDB

