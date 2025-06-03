const { MongoClient } = require("mongodb");
const Logger = require("../utils/logger");

class Database {
  constructor() {
    this.client = null;
    this.db = null;
    this.connectionString = "mongodb://localhost:27017";
    this.dbName = "ecommerce_db";
  }

  async connect() {
    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      Logger.info("Conectado ao MongoDB com sucesso");
      return this.db;
    } catch (error) {
      Logger.error("Erro ao conectar com MongoDB", error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        Logger.info("Desconectado do MongoDB");
      }
    } catch (error) {
      Logger.error("Erro ao desconectar do MongoDB", error);
      throw error;
    }
  }

  getDb() {
    if (!this.db) {
      throw new Error("Database não está conectado");
    }
    return this.db;
  }
}

module.exports = new Database();
