const BaseModel = require("./BaseModel");
const Logger = require("../utils/logger");

class Customer extends BaseModel {
  constructor() {
    super("customers");
    this.requiredFields = ["name", "email", "phone"];
  }

  validateCustomerData(data) {
    // Validação de email
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new Error("Email inválido");
      }
    }

    // Validação de telefone (formato brasileiro simples)
    if (data.phone) {
      // Remove espaços e caracteres especiais para validação
      const cleanPhone = data.phone.replace(/[\s\(\)\-]/g, "");
      // Aceita formatos: (11)99999-9999, 11999999999, (11) 99999-9999, etc.
      const phoneRegex = /^[1-9]{2}9?\d{8}$/;
      if (!phoneRegex.test(cleanPhone)) {
        throw new Error("Telefone inválido");
      }
    }

    if (data.name && data.name.length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres");
    }
  }

  async create(customerData) {
    try {
      this.validateCustomerData(customerData);

      // Verificar se email já existe
      const existingCustomer = await this.findByEmail(customerData.email);
      if (existingCustomer) {
        throw new Error("Email já cadastrado");
      }

      return await super.create(customerData);
    } catch (error) {
      Logger.error("Erro na criação de cliente", error);
      throw error;
    }
  }

  async findByEmail(email) {
    try {
      const collection = this.getCollection();
      const result = await collection.findOne({ email: email });

      if (result) {
        Logger.info(`Cliente encontrado por email: ${email}`);
      }

      return result;
    } catch (error) {
      Logger.error("Erro ao buscar cliente por email", error);
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
        `Busca por nome "${name}" retornou ${results.length} clientes`
      );
      return results;
    } catch (error) {
      Logger.error("Erro ao buscar clientes por nome", error);
      throw error;
    }
  }
}

module.exports = Customer;
