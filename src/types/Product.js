export class ProductCategory {
  constructor (
    id = null,
    name = null,
    products = []
  ) {
    this.id = id;
    this.name = name;
    this.products = products;
  }
}

export class Product {
  constructor (
    id = null,
    name = null,
    description = null,
    price = null,
    options = []
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.options = options;
    this.quantity = 0;
  }
}

export class ProductOptionType {
  constructor (
    id = null,
    name = null,
    options = []
  ) {
    this.id = id;
    this.name = name;
    this.options = options;
  }
}

export class ProductOption {
  constructor (
    id = null,
    name = null,
    price = null
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
  }
}