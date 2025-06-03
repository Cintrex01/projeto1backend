const BaseModel = require("./BaseModel");
const Logger = require("../utils/logger");
const { ObjectId } = require("mongodb");

class Order extends BaseModel {
  constructor() {
    super("orders");
    this.requiredFields = ["customerId", "items", "totalAmount"];
  }

  validateOrderData(data) {
    if (data.customerId && !ObjectId.isValid(data.customerId)) {
      throw new Error("ID do cliente inválido");
    }

    if (data.items && (!Array.isArray(data.items) || data.items.length === 0)) {
      throw new Error("Pedido deve conter pelo menos um item");
    }

    if (data.items) {
      for (const item of data.items) {
        if (!item.productId || !ObjectId.isValid(item.productId)) {
          throw new Error("ID do produto inválido nos itens");
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error("Quantidade deve ser maior que zero");
        }
        if (!item.price || item.price <= 0) {
          throw new Error("Preço deve ser maior que zero");
        }
      }
    }

    if (
      data.totalAmount &&
      (isNaN(data.totalAmount) || data.totalAmount <= 0)
    ) {
      throw new Error("Valor total deve ser um número positivo");
    }
  }

  async create(orderData) {
    try {
      this.validateOrderData(orderData);

      // Adicionar status padrão e data do pedido
      orderData.status = "pending";
      orderData.orderDate = new Date();

      return await super.create(orderData);
    } catch (error) {
      Logger.error("Erro na criação de pedido", error);
      throw error;
    }
  }

  async findByCustomerId(customerId) {
    try {
      if (!ObjectId.isValid(customerId)) {
        throw new Error("ID do cliente inválido");
      }

      const filter = { customerId: new ObjectId(customerId) };
      const results = await this.findAll(filter);
      Logger.info(
        `Encontrados ${results.length} pedidos para o cliente ${customerId}`
      );
      return results;
    } catch (error) {
      Logger.error("Erro ao buscar pedidos por cliente", error);
      throw error;
    }
  }

  async findByStatus(status) {
    try {
      const filter = { status: status };
      const results = await this.findAll(filter);
      Logger.info(
        `Encontrados ${results.length} pedidos com status "${status}"`
      );
      return results;
    } catch (error) {
      Logger.error("Erro ao buscar pedidos por status", error);
      throw error;
    }
  }

  async updateStatus(orderId, newStatus) {
    try {
      const validStatuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ];

      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Status inválido. Use: ${validStatuses.join(", ")}`);
      }

      const updateData = {
        status: newStatus,
        statusUpdatedAt: new Date(),
      };

      return await this.update(orderId, updateData);
    } catch (error) {
      Logger.error("Erro ao atualizar status do pedido", error);
      throw error;
    }
  }

  async getOrdersReport(startDate, endDate) {
    try {
      const filter = {
        orderDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };

      const collection = this.getCollection();
      const results = await collection
        .aggregate([
          { $match: filter },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: "$totalAmount" },
              averageOrderValue: { $avg: "$totalAmount" },
            },
          },
        ])
        .toArray();

      Logger.info(`Relatório gerado para período ${startDate} - ${endDate}`);
      return (
        results[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 }
      );
    } catch (error) {
      Logger.error("Erro ao gerar relatório de pedidos", error);
      throw error;
    }
  }
}

module.exports = Order;
