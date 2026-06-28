const { Order, OrderItem, Product } = require('../models');

const formatOrder = (order) => {
  const plainOrder = order.toJSON();
  return {
    ...plainOrder,
    total: Number(plainOrder.total),
    items: plainOrder.Products ? plainOrder.Products.map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price),
      qty: p.OrderItem.quantity,
      image_url: p.image_url
    })) : []
  };
};

exports.createOrder = async (req, res) => {
  const { customerName, phone, paymentMethod, cardNumber, items, total } = req.body;
  
  try {
    const orderCount = await Order.count();
    const orderCode = `#QB-${90000 + orderCount + 1}`;
    
    const newOrder = await Order.create({
      order_code: orderCode,
      customer_name: customerName,
      phone,
      payment_method: paymentMethod,
      card_number: cardNumber,
      total
    });

    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: newOrder.id,
        product_id: item.id,
        quantity: item.qty,
        price: item.price
      }));
      await OrderItem.bulkCreate(orderItems);
    }
    
    // Return order with items
    const orderWithItems = await Order.findOne({
      where: { id: newOrder.id },
      include: [Product]
    });
    
    res.status(201).json(formatOrder(orderWithItems));
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [Product],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders.map(formatOrder));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
