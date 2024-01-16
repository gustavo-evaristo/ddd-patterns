import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async find(id: string): Promise<Order> {
    try {
      const order = await OrderModel.findOne({
        where: { id },
        include: [{ model: OrderItemModel }],
      });

      const items = order.items.map(
        (orderItem) =>
          new OrderItem(
            orderItem.id,
            orderItem.name,
            orderItem.price,
            orderItem.product_id,
            orderItem.quantity
          )
      );

      return new Order(order.id, order.customer_id, items);
    } catch (error) {
      throw new Error("Order not found");
    }
  }

  async findAll(): Promise<Order[]> {
    const orders = await OrderModel.findAll({
      include: [{ model: OrderItemModel }],
    });
    const allOrders = orders.map((order) => {
      const items = order.items.map(
        (orderItem) =>
          new OrderItem(
            orderItem.id,
            orderItem.name,
            orderItem.price,
            orderItem.product_id,
            orderItem.quantity
          )
      );

      return new Order(order.id, order.customer_id, items);
    });

    return allOrders;
  }

  async update({ id, customerId }: Order): Promise<void> {
    console.log({ customerId });
    await OrderModel.update(
      {
        customerId,
      },
      {
        where: {
          id,
        },
      }
    );
  }
}
