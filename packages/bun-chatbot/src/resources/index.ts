import { processEnv } from "../env";
import { SavorProductController } from "./Product";

export const productController = new SavorProductController(processEnv.CMS_URL);


// const products = await productController.getRandomProducts();
// console.log(JSON.stringify(products.map(product => product.name), null, 2))
