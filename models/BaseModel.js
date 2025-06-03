const Database = require("../config/database");
const Logger = require("../utils/logger");
const { ObjectId } = require("mongodb");

class BaseModel {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.requiredFields = [];
  }

  getCollection() {
    const db = Database.getDb();
    return db.collection(this.collectionName);
  }

  validateRequiredFields(data) {
    const missingFields = [];

    for (const field of this.requiredFields) {
      if (
        !data[field] ||
        (typeof data[field] === "string" && data[field].trim() === "")
      ) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      throw new Error(
        `Campos obrigatórios não preenchidos: ${missingFields.join(", ")}`
      );
    }
  }

  async create(data) {
    try {
      this.validateRequiredFields(data);

      const collection = this.getCollection();
      data.createdAt = new Date();
      data.updatedAt = new Date();

      const result = await collection.insertOne(data);
      Logger.info(
        `${this.collectionName} criado com sucesso. ID: ${result.insertedId}`
      );

      return {
        success: true,
        id: result.insertedId,
        data: { _id: result.insertedId, ...data },
      };
    } catch (error) {
      Logger.error(`Erro ao criar ${this.collectionName}`, error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const collection = this.getCollection();
      const objectId = new ObjectId(id);
      const result = await collection.findOne({ _id: objectId });

      if (result) {
        Logger.info(`${this.collectionName} encontrado. ID: ${id}`);
      } else {
        Logger.warn(`${this.collectionName} não encontrado. ID: ${id}`);
      }

      return result;
    } catch (error) {
      Logger.error(`Erro ao buscar ${this.collectionName} por ID`, error);
      throw error;
    }
  }

  async findAll(filter = {}, options = {}) {
    try {
      const collection = this.getCollection();
      const results = await collection.find(filter, options).toArray();

      Logger.info(
        `Encontrados ${results.length} registros de ${this.collectionName}`
      );
      return results;
    } catch (error) {
      Logger.error(
        `Erro ao buscar todos os registros de ${this.collectionName}`,
        error
      );
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const collection = this.getCollection();
      const objectId = new ObjectId(id);

      updateData.updatedAt = new Date();
      const result = await collection.updateOne(
        { _id: objectId },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        throw new Error(
          `${this.collectionName} não encontrado para atualização`
        );
      }

      Logger.info(`${this.collectionName} atualizado com sucesso. ID: ${id}`);
      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      Logger.error(`Erro ao atualizar ${this.collectionName}`, error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const collection = this.getCollection();
      const objectId = new ObjectId(id);
      const result = await collection.deleteOne({ _id: objectId });

      if (result.deletedCount === 0) {
        throw new Error(`${this.collectionName} não encontrado para exclusão`);
      }

      Logger.info(`${this.collectionName} excluído com sucesso. ID: ${id}`);
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      Logger.error(`Erro ao excluir ${this.collectionName}`, error);
      throw error;
    }
  }
}

module.exports = BaseModel;
