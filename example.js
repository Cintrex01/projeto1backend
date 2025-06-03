const ECommerceLibrary = require("./index");

async function exampleUsage() {
  const ecommerce = new ECommerceLibrary();

  try {
    // Inicializar
    await ecommerce.initialize();
    console.log("✅ Biblioteca E-commerce inicializada");

    // Obter managers
    const productManager = ecommerce.getProductManager();
    const customerManager = ecommerce.getCustomerManager();
    const orderManager = ecommerce.getOrderManager();

    // Exemplo: Criar um novo produto
    console.log("\n📦 Criando novo produto...");
    const newProduct = await productManager.create({
      name: "iPhone 15 Pro",
      description: "iPhone 15 Pro 256GB - Titânio Natural",
      price: 7999.99,
      category: "Eletrônicos",
      stock: 30,
      brand: "Apple",
    });
    console.log("Produto criado com ID:", newProduct.id);

    // Exemplo: Buscar produtos por faixa de preço
    console.log("\n🔍 Buscando produtos entre R$1000 e R$3000...");
    const productsInRange = await productManager.findByPriceRange(1000, 3000);
    console.log(
      `Encontrados ${productsInRange.length} produtos na faixa de preço`
    );

    // Exemplo: Criar um cliente
    console.log("\n👤 Criando novo cliente...");
    const newCustomer = await customerManager.create({
      name: "Ana Paula Costa",
      email: "ana.costa@email.com",
      phone: "41977777777",
      address: {
        street: "Rua XV de Novembro, 789",
        city: "Curitiba",
        state: "PR",
        zipCode: "80020-310",
      },
    });
    console.log("Cliente criado com ID:", newCustomer.id);

    // Exemplo: Fazer um pedido
    console.log("\n🛒 Criando novo pedido...");
    const newOrder = await orderManager.create({
      customerId: newCustomer.id,
      items: [
        {
          productId: newProduct.id,
          quantity: 1,
          price: 7999.99,
        },
      ],
      totalAmount: 7999.99,
      shippingAddress: newCustomer.data.address,
    });
    console.log("Pedido criado com ID:", newOrder.id);

    // Exemplo: Acompanhar o pedido
    console.log("\n📋 Atualizando status do pedido...");
    await orderManager.updateStatus(newOrder.id, "processing");
    console.log("Status atualizado para: processing");

    // Exemplo: Buscar histórico do cliente
    console.log("\n📚 Buscando histórico de pedidos do cliente...");
    const customerHistory = await orderManager.findByCustomerId(newCustomer.id);
    console.log(`Cliente possui ${customerHistory.length} pedido(s)`);

    console.log("\n✅ Exemplo de uso concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro:", error.message);
  } finally {
    await ecommerce.close();
  }
}

// Executar exemplo se este arquivo for executado diretamente
if (require.main === module) {
  exampleUsage().catch(console.error);
}

module.exports = { exampleUsage };
