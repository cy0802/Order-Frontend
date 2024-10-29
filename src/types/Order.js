export class OrderRequest {
  constructor(
      userId = null, 
      handlerId = null,
      tableId = null,  
      orderItems = []
  ) {
    this.userId = userId;
    this.handlerId = handlerId;
    this.tableId = tableId;
    this.orderItems = orderItems;
  }
  payload() {
    let data = {
      table_id: this.tableId,
      order_items: this.orderItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity
      }))
    }
    if (this.userId) {
      data.user_id = this.userId;
    }
    if (this.handlerId) {
      data.handler_id = this.handlerId;
    }
    return data;
  }
}

export class OrderItem {
  constructor(
      productId = null, 
      quantity = 0
  ) {
    this.productId = productId;
    this.quantity = quantity;
  }
}