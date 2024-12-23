import type { JobData } from "../types/JobData";
import { BaseJobHandler } from "../types/BaseJobHandler";
import { numberToCurrency } from "../../libs/utils";
import type { Product } from "../../resources/Product";
import type { Queue } from "../../queue/Queue";

async function showProducts(products: Product[], jobData: JobData<string>, queue: Queue) {
  if (jobData.type !== "INTRO_RANDOM_PRODUCTS" && jobData.type !== "SEARCH_PRODUCT") {
    throw new Error(`Cannot show product for job type: ${jobData.type}`);
  }

  if (jobData.type === 'SEARCH_PRODUCT' && products.length === 0) {
    const query = jobData.payload.query;
    await queue.add({
      name: "RESPOND",
      data: {
        type: "RESPOND",
        payload: {
          message: `Không tìm thấy sản phẩm phù hợp với tìm kiếm cho "${query}"`,
          platformUser: jobData.payload.platformUser,
          platform: jobData.payload.platform,
          session: jobData.payload.session,
        },
      }
    });
    return;
  }

  for (const product of products) {
    await queue.add({
      name: "RESPOND",
      data: {
        type: "RESPOND",
        payload: {
          message: `${product.name}
🔗 ${product.url}
${product.content}

Các lựa chọn:
${product.variants.map(variant => `👉 ${variant.name}: ${numberToCurrency(variant.price)}`).join("\n")}`,
          platformUser: jobData.payload.platformUser,
          platform: jobData.payload.platform,
          session: jobData.payload.session,
        },
      },
    });
  }
}

export class RandomProductsHandler<ID> extends BaseJobHandler<ID> {
  async handle(jobData: JobData<string>) {
    if (jobData.type !== "INTRO_RANDOM_PRODUCTS") {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }

    const products = await this.productController.getRandomProducts();

    await showProducts(products, jobData, this.queue);

  }
}

export class SearchProductHandler<ID> extends BaseJobHandler<ID> {
  async handle(jobData: JobData<string>) {
    if (jobData.type !== "SEARCH_PRODUCT") {
      throw new Error(`Unknown job type: ${jobData.type}`);
    }

    const products = await this.productController.search(jobData.payload.query, 3, 1);

    await showProducts(products, jobData, this.queue);
  }
}
