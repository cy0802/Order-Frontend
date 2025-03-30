import axios from 'axios';
import { Product, ProductCategory, ProductOptionType, ProductOption} from '../types/Product';

const apiClient = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async () => {
  let err = null;
  let productCategories = [];
  try {
    const response = await apiClient.get('/api/products');
    productCategories = response.data.map(category => {
      const products = category.products.map(product => {
        const optionTypes = product.options.map(optionType => {
          const options = optionType.options.map(option => {
            return new ProductOption(option.id, option.name, option.price);
          });
          return new ProductOptionType(optionType.id, optionType.name, options);
        });
        return new Product(product.id, product.name, product.description, product.price, optionTypes);
      });
      return new ProductCategory(category.category_id, category.category, products);
    });
  } catch (error) {
    err = error;
  }
  return { err, productCategories };
}