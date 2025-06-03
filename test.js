const ECommerceLibrary = require("./index");

async function runTests() {
  const ecommerce = new ECommerceLibrary();

  try {
    // Inicializar conexão
    console.log("=== INICIANDO TESTES DA E-COMMERCE LIBRARY ===\n");
    await ecommerce.initialize();

    // Teste 1: Criar produtos
    console.log("1. TESTANDO CRIAÇÃO DE PRODUTOS");
    const productManager = ecommerce.getProductManager();

    const product1 = await productManager.create({
      name: "Smartphone Samsung Galaxy",
      description: "Smartphone com 128GB de armazenamento",
      price: 1299.99,
      category: "Eletrônicos",
      stock: 50,
      brand: "Samsung",
    });
    console.log("Produto 1 criado:", product1.id);

    const product2 = await productManager.create({
      name: "Notebook Dell Inspiron",
      description: "Notebook Intel i5, 8GB RAM, SSD 256GB",
      price: 2499.99,
      category: "Informática",
      stock: 25,
      brand: "Dell",
    });
    console.log("Produto 2 criado:", product2.id);

    // Teste 2: Criar clientes
    console.log("\n2. TESTANDO CRIAÇÃO DE CLIENTES");
    const customerManager = ecommerce.getCustomerManager();

    const customer1 = await customerManager.create({
      name: "João da Silva",
      email: "joao@email.com",
      phone: "41999999999", // Formato mais simples
      address: {
        street: "Rua das Flores, 123",
        city: "Curitiba",
        state: "PR",
        zipCode: "80000-000",
      },
    });
    console.log("Cliente 1 criado:", customer1.id);

    const customer2 = await customerManager.create({
      name: "Maria Santos",
      email: "maria@email.com",
      phone: "41988888888", // Formato mais simples
      address: {
        street: "Av. Brasil, 456",
        city: "Curitiba",
        state: "PR",
        zipCode: "80000-001",
      },
    });
    console.log("Cliente 2 criado:", customer2.id);

    // Teste 3: Criar pedidos
    console.log("\n3. TESTANDO CRIAÇÃO DE PEDIDOS");
    const orderManager = ecommerce.getOrderManager();

    const order1 = await orderManager.create({
      customerId: customer1.id,
      items: [
        {
          productId: product1.id,
          quantity: 1,
          price: 1299.99,
        },
      ],
      totalAmount: 1299.99,
      shippingAddress: customer1.data.address,
    });
    console.log("Pedido 1 criado:", order1.id);

    // Teste 4: Buscar dados
    console.log("\n4. TESTANDO BUSCAS");

    // Buscar produtos por categoria
    const electronics = await productManager.findByCategory("Eletrônicos");
    console.log("Produtos na categoria Eletrônicos:", electronics.length);

    // Buscar produtos por nome
    const samsungProducts = await productManager.searchByName("Samsung");
    console.log("Produtos Samsung encontrados:", samsungProducts.length);

    // Buscar cliente por email
    const foundCustomer = await customerManager.findByEmail("joao@email.com");
    console.log(
      "Cliente encontrado por email:",
      foundCustomer ? foundCustomer.name : "Não encontrado"
    );

    // Buscar pedidos por cliente
    const customerOrders = await orderManager.findByCustomerId(customer1.id);
    console.log("Pedidos do cliente:", customerOrders.length);

    // Teste 5: Atualizar dados
    console.log("\n5. TESTANDO ATUALIZAÇÕES");

    // Atualizar estoque do produto
    await productManager.updateStock(product1.id, 45);
    console.log("Estoque atualizado");

    // Atualizar status do pedido
    await orderManager.updateStatus(order1.id, "confirmed");
    console.log("Status do pedido atualizado");

    // Teste 6: Validações de erro
    console.log("\n6. TESTANDO VALIDAÇÕES DE ERRO");

    try {
      // Tentar criar produto sem campos obrigatórios
      await productManager.create({
        name: "Produto Incompleto",
        // Faltam campos obrigatórios
      });
    } catch (error) {
      console.log("Erro capturado (esperado):", error.message);
    }

    try {
      // Tentar criar cliente com email inválido
      await customerManager.create({
        name: "Cliente Teste",
        email: "email-invalido",
        phone: "41999999999",
      });
    } catch (error) {
      console.log("Erro capturado (esperado):", error.message);
    }

    // Teste 7: Relatório
    console.log("\n7. TESTANDO RELATÓRIO");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();

    const report = await orderManager.getOrdersReport(startDate, endDate);
    console.log("Relatório dos últimos 30 dias:", report);

    console.log("\n=== TODOS OS TESTES CONCLUÍDOS COM SUCESSO ===");
  } catch (error) {
    console.error("Erro durante os testes:", error.message);
  } finally {
    // Fechar conexão
    await ecommerce.close();
  }
}

// Executar testes se este arquivo for executado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
