import { stringify } from "qs-esm";

export interface ProductVariant {
  sku: string;
  price: number;
  name: string;
}

export interface Product {
  id: string;
  url: string;
  name: string;
  content: string;
  image: string;

  variants: ProductVariant[];
}

export abstract class ProductController {
  abstract getRandomProducts(): Promise<Product[]>;
  abstract search(query: string, limit?: number, page?: number): Promise<Product[]>;
}

export class SavorProductController extends ProductController {
  constructor(private url: string) {
    super();
  }

  async getRandomProducts(): Promise<Product[]> {
    const select = {
      id: true,
      description: true,
      content: true,
      slug: true,
      image: {
        sizes: {
          tablet: {
            filename: true,
          },
        },
      },
      variants: {
        sku: true,
        salePrice: true,
        normalPrice: true,
        size: true,
        sizeName: true,
      },
    }
    const where = {
      tags: {
        equals: 'active',
      },
      collections: {
        equals: '67077b257f29066e3cf1e794'
      },
    }

    const stringifiedQuery = stringify({ select, where, limit: 3, page: Math.floor(Math.random() * 40) + 1 }, { addQueryPrefix: true })
    console.log(`${this.url}/website-products?${stringifiedQuery}`);
    const response = await fetch(`${this.url}/website-products?${stringifiedQuery}`);
    const data = await response.json();


    return data.docs.map((product: any) => ({
      id: product.id,
      name: product.description,
      content: product.content,
      url: `https://www.savor.vn/products/${product.slug}`,
      image: `https://storage.4-handy.com/4handy-cms/${product.image?.sizes?.tablet?.filename || product.variants[0].image?.sizes?.tablet?.filename}`,
      variants: product.variants.map((variant: any) => ({
        sku: variant.sku,
        price: variant.salePrice || variant.normalPrice,
        name: `${variant.size} (${variant.sizeName})`,
      })),
    }));
  }

  async search(query?: string, limit = 10, page = 1): Promise<Product[]> {
    const select = {
      id: true,
      description: true,
      content: true,
      slug: true,
      image: {
        sizes: {
          tablet: {
            filename: true,
          },
        },
      },
      variants: {
        sku: true,
        salePrice: true,
        normalPrice: true,
        size: true,
        sizeName: true,
        image: {
          sizes: {
            tablet: {
              filename: true,
            },
          },
        },
      },
    }

    const where = {
      tags: {
        equals: 'active',
      },
      collections: {
        equals: '67077b257f29066e3cf1e794'
      },
      or: query ? [
        {
          description: {
            contains: query,
          },
        },
        {
          content: {
            contains: query,
          },
        },
      ] : undefined,
    }

    const stringifiedQuery = stringify({ select, where, limit, page }, { addQueryPrefix: true })

    console.log(`${this.url}/website-products?${stringifiedQuery}`);

    const response = await fetch(`${this.url}/website-products?${stringifiedQuery}`);
    const data = await response.json();
    console.log(data);

    return data.docs.map((product: any) => ({
      id: product.id,
      name: product.description,
      content: product.content,
      url: `https://www.savor.vn/products/${product.slug}`,
      image: `https://storage.4-handy.com/4handy-cms/${product.image?.sizes?.tablet?.filename || product.variants[0].image?.sizes?.tablet?.filename}`,
      variants: product.variants.map((variant: any) => ({
        sku: variant.sku,
        price: variant.salePrice || variant.normalPrice,
        name: `${variant.size} (${variant.sizeName})`,
      })),
    }));
  }
}
