const Database = require("./config/database");
const Product = require("./models/Product");
const Customer = require("./models/Customer");
const Order = require("./models/Order");
const Logger = require("./utils/logger");

class ECommerceLibrary {
  constructor() {
    this.product = new Product();
    this.customer = new Customer();
    this.order = new Order();
    this.isConnected = false;
  }

  async initialize() {
    try {
      await Database.connect();
      this.isConnected = true;
      Logger.info("E-Commerce Library inicializada com sucesso");
    } catch (error) {
      Logger.error("Erro ao inicializar E-Commerce Library", error);
      throw error;
    }
  }

  async close() {
    try {
      await Database.disconnect();
      this.isConnected = false;
      Logger.info("E-Commerce Library finalizada");
    } catch (error) {
      Logger.error("Erro ao finalizar E-Commerce Library", error);
      throw error;
    }
  }

  getProductManager() {
    this.checkConnection();
    return this.product;
  }

  getCustomerManager() {
    this.checkConnection();
    return this.customer;
  }

  getOrderManager() {
    this.checkConnection();
    return this.order;
  }

  checkConnection() {
    if (!this.isConnected) {
      throw new Error("Library não está conectada ao banco de dados");
    }
  }
}

module.exports = ECommerceLibrary;
