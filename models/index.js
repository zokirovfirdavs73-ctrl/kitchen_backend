const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Relationships
Order.belongsToMany(Product, { through: OrderItem, foreignKey: 'order_id' });
Product.belongsToMany(Order, { through: OrderItem, foreignKey: 'product_id' });

module.exports = {
  User,
  Product,
  Order,
  OrderItem
};
