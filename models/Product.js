const BaseModel = require("./BaseModel");
const Logger = require("../utils/logger");

class Product extends BaseModel {
  constructor() {
    super("products");
    this.requiredFields = ["name", "price", "category", "stock"];
  }

  validateProductData(data) {
    // Validações específicas de produto
    if (data.price && (isNaN(data.price) || data.price < 0)) {
      throw new Error("Preço deve ser um número positivo");
    }

    if (data.stock && (isNaN(data.stock) || data.stock < 0)) {
      throw new Error("Estoque deve ser um número positivo");
    }

    if (data.name && data.name.length < 2) {
      throw new Error("Nome do produto deve ter pelo menos 2 caracteres");
    }
  }

  async create(productData) {
    try {
      this.validateProductData(productData);
      return await super.create(productData);
    } catch (error) {
      Logger.error("Erro na validação de produto", error);
      throw error;
    }
  }

  async searchByName(name) {
    try {
      const filter = {
        name: { $regex: name, $options: "i" },
      };
      const results = await this.findAll(filter);
      Logger.info(
        `Busca por nome "${name}" retornou ${results.length} produtos`
      );
      return results;
    } catch (error) {
      Logger.error("Erro ao buscar produtos por nome", error);
      throw error;
    }
  }

  async findByCategory(category) {
    try {
      const filter = { category: category };
      const results = await this.findAll(filter);
      Logger.info(
        `Encontrados ${results.length} produtos na categoria "${category}"`
      );
      return results;
    } catch (error) {
      Logger.error("Erro ao buscar produtos por categoria", error);
      throw error;
    }
  }

  async findByPriceRange(minPrice, maxPrice) {
    try {
      const filter = {
        price: {
          $gte: minPrice,
          $lte: maxPrice,
        },
      };
      const results = await this.findAll(filter);
      Logger.info(
        `Encontrados ${results.length} produtos na faixa de preço R$${minPrice} - R$${maxPrice}`
      );
      return results;
    } catch (error) {
      Logger.error("Erro ao buscar produtos por faixa de preço", error);
      throw error;
    }
  }

  async updateStock(productId, newStock) {
    try {
      if (isNaN(newStock) || newStock < 0) {
        throw new Error("Estoque deve ser um número positivo");
      }

      const updateData = { stock: newStock };
      return await this.update(productId, updateData);
    } catch (error) {
      Logger.error("Erro ao atualizar estoque", error);
      throw error;
    }
  }
}

module.exports = Product;
