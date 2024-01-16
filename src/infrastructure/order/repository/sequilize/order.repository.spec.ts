import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;
  let orderRepository: OrderRepository;
  let productRepository: ProductRepository;
  let customerRepository: CustomerRepository;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);

    await sequelize.sync();

    orderRepository = new OrderRepository();
    productRepository = new ProductRepository();
    customerRepository = new CustomerRepository();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should throw an error when order is not found", () => {
    expect(async () => {
      await orderRepository.find("1");
    }).rejects.toThrow("Order not found");
  });

  it("should find a order", async () => {
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const orderToCreate = new Order("123", customer.id, [orderItem]);

    await orderRepository.create(orderToCreate);

    const order = await orderRepository.find("123");

    expect(order.id).toBe(orderToCreate.id);
    expect(order.customerId).toBe(customer.id);
    expect(order.items[0].id).toBe(orderItem.id);
  });

  it("should find all orders", async () => {
    const customer1 = new Customer("1", "Customer 1");
    const customer2 = new Customer("2", "Customer 2");

    const address1 = new Address("Street 1", 1, "Zipcode 1", "City 1");
    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 2");

    customer1.changeAddress(address1);
    customer2.changeAddress(address2);

    await Promise.all([
      customerRepository.create(customer1),
      customerRepository.create(customer2),
    ]);

    const productRepository = new ProductRepository();

    const product1 = new Product("1", "Product 1", 10);
    const product2 = new Product("2", "Product 2", 10);

    await Promise.all([
      productRepository.create(product1),
      productRepository.create(product2),
    ]);

    const orderItem1 = new OrderItem(
      "1",
      product1.name,
      product1.price,
      product1.id,
      2
    );

    const orderItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      2
    );

    const order1 = new Order("1", customer1.id, [orderItem1]);
    const order2 = new Order("2", customer2.id, [orderItem2]);

    await Promise.all([
      orderRepository.create(order1),
      orderRepository.create(order2),
    ]);

    const orders = await orderRepository.findAll();

    expect(orders).toHaveLength(2);
    expect(orders).toContainEqual(order1);
    expect(orders).toContainEqual(order2);
  });

  it("should update a order", async () => {
    const customer = new Customer("1", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product = new Product("1", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      1
    );

    const order = new Order("1", customer.id, [orderItem]);
    await orderRepository.create(order);

    const product2 = new Product("2", "Product 2", 20);
    await productRepository.create(product2);

    const orderItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      2
    );

    order.addItem(orderItem2);

    await orderRepository.update(order);

    const findOrder = await orderRepository.find(order.id);

    expect(findOrder.id).toBe(order.id);
    expect(findOrder.items).toHaveLength(order.items.length);
    expect(findOrder.total()).toBe(order.total());
  });
});
