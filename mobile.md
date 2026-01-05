# Mobile Products API Documentation

## Overview

This API endpoint provides a mobile-friendly interface for fetching product listings from the JiMATBiz marketplace. It's designed for use in React Native or Capacitor mobile applications and returns paginated, filtered product data optimized for mobile consumption.

## Endpoint

**URL:** `POST /supabase/mobile/products/list`

**Base URL:** `https://ex_supabase.jimatbiz.com` (or your configured environment URL)

**Full Endpoint:** `https://ex_supabase.jimatbiz.com/supabase/mobile/products/list`

## Authentication

This endpoint requires authentication via one of the following methods:

1. **Authorization Header (Bearer Token):**
   ```
   Authorization: Bearer <your_api_token>
   ```

2. **Custom Header:**
   ```
   x-api-token: <your_api_token>
   ```

The API token should be stored securely in your app's environment variables.

## Request Parameters

All parameters are optional and can be sent in the request body as JSON:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit_count` | integer | 24 | Number of products to return per page |
| `offset_count` | integer | 0 | Offset for pagination (use with `limit_count`) |
| `page` | integer | 1 | Page number (alternative to `offset_count`). If provided, calculates offset automatically |
| `search_query` | string | "" | Search term to filter products by name, description, category, or subcategory |
| `category_filter` | string | "All Categories" | Filter by product category. Use "All Categories" to show all |
| `subcategory_filter` | string | "All Subcategories" | Filter by product subcategory. Use "All Subcategories" to show all |
| `brand_filter` | string | "All Brands" | Filter by brand name. Use "All Brands" to show all |
| `buyer_city` | string | null | Filter products by buyer's city (for location-based filtering) |
| `use_semantic_search` | boolean | true | Enable AI-powered semantic search for better search results |
| `semantic_threshold` | float | 0.2 | Semantic similarity threshold (0.0 to 1.0). Lower values return more results |

### Notes on Parameters

- **Pagination:** You can use either `page` + `limit_count` OR `offset_count` + `limit_count`. The `page` parameter is more intuitive for mobile apps.
- **Search:** When `use_semantic_search` is `true`, the API uses AI embeddings to find semantically similar products, not just exact text matches.
- **Filters:** All filter parameters support "All X" values to disable filtering for that dimension.

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Product Name",
      "category": "Food & Beverages",
      "subcategory": "Snacks",
      "normal_price": 100.0,
      "promotion_price": 80.0,
      "stock_level": 50,
      "cover_image_url": "https://example.com/image.jpg",
      "seller_id": "550e8400-e29b-41d4-a716-446655440001",
      "seller_name": "Seller Business Name",
      "products_sold": 100,
      "total_orders": 20,
      "unique_buyers": 15,
      "is_fast_moving": true,
      "is_featured": false,
      "fast_moving_rank_seller": 1,
      "fast_moving_rank_platform": 5,
      "discount_percentage": 20,
      "semantic_similarity": 0.85,
      "brand_id": "550e8400-e29b-41d4-a716-446655440002",
      "brand_name": "Brand Name"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_count": 240,
    "limit": 24,
    "offset": 0,
    "has_next_page": true,
    "has_previous_page": false
  },
  "filters": {
    "search_query": "",
    "category": "All Categories",
    "subcategory": "All Subcategories",
    "brand": "All Brands",
    "buyer_city": null,
    "use_semantic_search": true
  }
}
```

### Product Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique product identifier |
| `name` | string | Product name |
| `category` | string | Product category |
| `subcategory` | string | Product subcategory |
| `normal_price` | number | Regular price |
| `promotion_price` | number \| null | Promotional price (if available) |
| `stock_level` | integer | Available stock quantity |
| `cover_image_url` | string | Product image URL |
| `seller_id` | string (UUID) | Seller's unique identifier |
| `seller_name` | string | Seller's business name |
| `products_sold` | integer | Total quantity sold |
| `total_orders` | integer | Total number of orders |
| `unique_buyers` | integer | Number of unique buyers |
| `is_fast_moving` | boolean | Whether product is fast-moving |
| `is_featured` | boolean | Whether product is featured |
| `fast_moving_rank_seller` | integer \| null | Rank within seller's products |
| `fast_moving_rank_platform` | integer \| null | Rank across entire platform |
| `discount_percentage` | integer | Discount percentage (0-100) |
| `semantic_similarity` | number \| null | Semantic similarity score (0.0-1.0) |
| `brand_id` | string \| null | Brand identifier |
| `brand_name` | string \| null | Brand name |

### Error Response (400/500)

```json
{
  "success": false,
  "error": "database_error",
  "message": "Error message here"
}
```

## Usage Examples

### TypeScript/React Example

```typescript
// api/mobileProducts.ts

const API_BASE_URL = process.env.EXPO_PUBLIC_EX_SUPABASE_API_URL || 'https://ex_supabase.jimatbiz.com';
const API_TOKEN = process.env.EXPO_PUBLIC_SUPABASE_API_TOKEN;

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  normal_price: number;
  promotion_price: number | null;
  stock_level: number;
  cover_image_url: string;
  seller_id: string;
  seller_name: string;
  products_sold: number;
  total_orders: number;
  unique_buyers: number;
  is_fast_moving: boolean;
  is_featured: boolean;
  fast_moving_rank_seller: number | null;
  fast_moving_rank_platform: number | null;
  discount_percentage: number;
  semantic_similarity: number | null;
  brand_id: string | null;
  brand_name: string | null;
}

export interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  limit: number;
  offset: number;
  has_next_page: boolean;
  has_previous_page: boolean;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: PaginationInfo;
  filters: {
    search_query: string;
    category: string;
    subcategory: string;
    brand: string;
    buyer_city: string | null;
    use_semantic_search: boolean;
  };
}

export interface ProductsRequest {
  limit_count?: number;
  offset_count?: number;
  page?: number;
  search_query?: string;
  category_filter?: string;
  subcategory_filter?: string;
  brand_filter?: string;
  buyer_city?: string | null;
  use_semantic_search?: boolean;
  semantic_threshold?: number;
}

export async function fetchProducts(
  params: ProductsRequest = {}
): Promise<ProductsResponse> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  const response = await fetch(`${API_BASE_URL}/supabase/mobile/products/list`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.message || error.error || 'Failed to fetch products');
  }

  return response.json();
}
```

### React Hook Example

```typescript
// hooks/useProducts.ts

import { useState, useEffect } from 'react';
import { fetchProducts, ProductsRequest, ProductsResponse } from '../api/mobileProducts';

export function useProducts(initialParams: ProductsRequest = {}) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProducts = async (params: ProductsRequest = {}) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchProducts({ ...initialParams, ...params });
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products: data?.data || [],
    pagination: data?.pagination,
    filters: data?.filters,
    loading,
    error,
    refetch: loadProducts,
  };
}
```

### React Component Example

```tsx
// components/ProductList.tsx

import React, { useState } from 'react';
import { View, FlatList, TextInput, Button, ActivityIndicator } from 'react-native';
import { useProducts } from '../hooks/useProducts';
import ProductCard from './ProductCard';

export default function ProductList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const { products, pagination, loading, error, refetch } = useProducts({
    page,
    limit_count: 20,
    search_query: searchQuery,
    category_filter: categoryFilter,
    use_semantic_search: true,
  });

  const handleSearch = () => {
    setPage(1);
    refetch({
      page: 1,
      search_query: searchQuery,
      category_filter: categoryFilter,
    });
  };

  const handleLoadMore = () => {
    if (pagination?.has_next_page && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      refetch({
        page: nextPage,
        search_query: searchQuery,
        category_filter: categoryFilter,
      });
    }
  };

  if (error) {
    return (
      <View>
        <Text>Error: {error.message}</Text>
        <Button title="Retry" onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <View>
      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search products..."
        onSubmitEditing={handleSearch}
      />
      <Button title="Search" onPress={handleSearch} />

      {loading && page === 1 ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && page > 1 ? <ActivityIndicator size="small" /> : null
          }
        />
      )}

      {pagination && (
        <Text>
          Page {pagination.current_page} of {pagination.total_pages} ({pagination.total_count} total)
        </Text>
      )}
    </View>
  );
}
```

### Capacitor HTTP Example

```typescript
import { Http } from '@capacitor-community/http';

const API_BASE_URL = 'https://ex_supabase.jimatbiz.com';
const API_TOKEN = 'your_api_token_here';

export async function fetchProductsCapacitor(params: ProductsRequest = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(API_TOKEN ? { 'Authorization': `Bearer ${API_TOKEN}` } : {}),
  };

  const response = await Http.request({
    method: 'POST',
    url: `${API_BASE_URL}/supabase/mobile/products/list`,
    headers,
    data: params,
  });

  if (response.status !== 200) {
    throw new Error(response.data?.message || 'Failed to fetch products');
  }

  return response.data as ProductsResponse;
}
```

## Common Use Cases

### 1. Initial Product Load

```typescript
const products = await fetchProducts({
  page: 1,
  limit_count: 24,
});
```

### 2. Search Products

```typescript
const products = await fetchProducts({
  search_query: 'chocolate',
  use_semantic_search: true,
  semantic_threshold: 0.2,
});
```

### 3. Filter by Category

```typescript
const products = await fetchProducts({
  category_filter: 'Food & Beverages',
  subcategory_filter: 'Snacks',
});
```

### 4. Location-Based Filtering

```typescript
const products = await fetchProducts({
  buyer_city: 'Kuala Lumpur',
});
```

### 5. Pagination

```typescript
// Load page 2
const products = await fetchProducts({
  page: 2,
  limit_count: 24,
});

// Or use offset
const products = await fetchProducts({
  offset_count: 24,
  limit_count: 24,
});
```

## Error Handling

Always handle potential errors:

```typescript
try {
  const response = await fetchProducts({ page: 1 });
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to fetch products:', error.message);
    // Show error to user
  }
}
```

## Best Practices

1. **Caching:** Consider caching product data locally to reduce API calls
2. **Pagination:** Load products incrementally as user scrolls (infinite scroll)
3. **Debouncing:** Debounce search input to avoid excessive API calls
4. **Error Handling:** Always handle network errors gracefully
5. **Loading States:** Show loading indicators during API calls
6. **Image Optimization:** Use image caching/CDN for product images
7. **Token Security:** Never expose API tokens in client-side code. Use environment variables or secure storage

## Environment Variables

Set these in your `.env` file or Capacitor config:

```env
EXPO_PUBLIC_EX_SUPABASE_API_URL=https://ex_supabase.jimatbiz.com
EXPO_PUBLIC_SUPABASE_API_TOKEN=your_api_token_here
```

## Support

For issues or questions, refer to the main API documentation or contact the backend team.

