// Funções dos botões do modal
const Modal = {

  open() {
    // Abrir modal
    // Adicionar a classe active ao modal
    document
      .querySelector('.modal-overlay').
      classList
      .add('active');
  },
  close() {
    // fechar Modal
    // remover a classe active do modal
    document
      .querySelector('.modal-overlay')
      .classList
      .remove('active');
  }
}

// Armazenamento
const Storage = {
  get(){
    return JSON.parse(localStorage.getItem("my.finances:transactions")) || []
  },

  set(transactions) {
    localStorage.setItem("my.finances:transactions", JSON.stringify(transactions));
  },
}

// Entradas, Saídas, Total
const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },

  remove(index) {
    Transaction.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0;
    // pegar todas as entradas
    // para cada transação,
    Transaction.all.forEach(transaction => {
      //se ela for maior que zero
      if (transaction.amount > 0) {
        //somar a uma variável e retornar a variável
        income += transaction.amount;
      }
    })
    return income;
  },

  expenses() {
    let expense = 0;
    // pegar todas as saida
    // para cada transação,
    Transaction.all.forEach(transaction => {
      //se ela for maior que zero
      if (transaction.amount < 0) {
        //somar a uma variável e retornar a variável
        expense += transaction.amount;
      }
    })
    return expense;

  },

  total() {
    // entradas - saídas
    return Transaction.incomes() + Transaction.expenses();
  }
}

// Substituir os dados do HTML com os dados do JS
const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    // criando um elemento através da DOM
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransition(transaction);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);

  },

  // HTML interno de uma transação - funcionalidade que será feito o html
  innerHTMLTransition(transaction, index) {

    const CSSclass = transaction.amount > 0 ? "income" : "expense";

    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
          <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
    `

    return html;
  },

  // atualiza saldo
  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())

    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())

    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  }
}

// Formatação
const Utils = {
  formatAmount(value) {
    value = Number(value.replace(/\,\./g, "")) * 100;

    return value;
  },

  formatDate(date) {
    const splittedDate = date.split("-");

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },


  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    return signal + value;

  }
}

// Formulário
const Form = {

  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  // pega os valores
  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  //valida os campos
  validateFields() {
    const { description, amount, date } = Form.getValues();

    if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  // formata os valores valor e data
  formatValues() {
    let { description, amount, date } = Form.getValues();

    amount = Utils.formatAmount(amount);

    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date
    }
  },

  saveTransaction(transaction) {
    Transaction.add(transaction);

    // atualizar a Aplicação
    App.reload();

    // fechar o modal
    Modal.close();
  },

  clearFields() {
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },

  submit(event) {
    event.preventDefault();

    try {
      // verificar se todas as informações foram preenchidas
      Form.validateFields();

      // formatar os dados para salvar 
      const transaction = Form.formatValues();

      // salvar
      Form.saveTransaction(transaction);

      // limpar os dados do formulário
      Form.clearFields();

    } catch (error) {
      alert(error.message);
    }
  }
}

// Aplicação
const App = {
  init() {
    // forEach é usado para array
    Transaction.all.forEach(DOM.addTransaction);
    
    DOM.updateBalance();

    Storage.set(Transaction.all);

  },
  reload() {
    DOM.clearTransactions();
    App.init();
  },
}

App.init();

