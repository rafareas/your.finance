const Modal = {
    open(){
        //abrir modal
        //adcionar a classe active 
        document
        .querySelector('.modal-overlay')
        .classList
        .add('active')
    },
    close(){
        //fechar o Modal
        //remover a class active no Modal
        document
        .querySelector('.modal-overlay')
        .classList
        .remove('active')
    }
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("your.finance:transactions")) || []
    },

    set(transactions){
        localStorage.setItem("your.finance:transactions",JSON.stringify(transactions))
    }
}

const Transaction = {
    all:/*[  { 
       
        description: 'Luz',
        amount:-50000,
        date: '23/01/2021',
    },
    { 
        
        description: 'Website',
        amount:500000,
        date: '23/01/2021',
    },
    { 
    
        description: 'Internet',
        amount:-20000,
        date: '23/01/2021',
    },
    { 
        description: 'app',
        amount:200000,
        date: '23/01/2021'
    }]*/ Storage.get(),
    
    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index){
        Transaction.all.splice(index, 1)
        
        App.reload()
    },
    
    incomes(){
        let income = 0;
        // pegar todas as transações
        // para cada transaçao,
        Transaction.all.forEach(transaction =>{
            // se ela for maior que zero
            if(transaction.amount > 0){
                // somar a uma variavel e retornar a variavel
                income += transaction.amount;
            }
        })
        
        return income
    },
    
    expenses(){
        let expense = 0;
        // pegar todas as transações
        // para cada transaçao,
        Transaction.all.forEach(transaction =>{
            // se ela for maior que zero
            if(transaction.amount < 0){
                // somar a uma variavel e retornar a variavel
                expense += transaction.amount;
            }
        })
        
        return expense
    },
    
    total(){
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {

    transactionsContainer : document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction,index) 
        tr.dataset.index = index
        
        DOM.transactionsContainer.appendChild(tr) 
    },

    innerHTMLTransaction(transaction,index){
        //o income e o expense vem do css
        const CSSclass = transaction.amount > 0 ? "income" : "expense" 

        const amount = Utils.formatCurrency(transaction.amount) 

        const html = 
        `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
              <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
            </td>
    
        `

        return html
    },

    updateBalance(){
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

    clearTransaction(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        //multiplica por 100 pq se alguem colocar um . ou , 
        //vai sair um numero diferente 
        //oq vai atrapalhar quando dividir por 100 para formatar
        // no formatCurrency
        value = Number(value)*100 

        return value
        
    },

    formatDate(date){
        //serve para poder mudar a formatação
        //de 2021-01-23 para 23/01/2021 (qualquer duvida,usar console log)
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value){
        const signal = Number(value) < 0 ? "- " : ""
        
        value = String(value).replace(/\D/g,"")

        value = Number(value)/100

        value = value.toLocaleString("pt-BR", {
            style:"currency",
            currency: "BRL"
        })
        
        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    
    validateFields(){
        const {description,amount,date} = Form.getValues()
        
        //trim serve para fazer uma limpeza dos espaços vazios
        if(description.trim() === "" || 
        amount.trim() === "" ||
        date === "" ){
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues(){
        let { description,amount,date } = Form.getValues()
        
        amount = Utils.formatAmount(amount)
        
        date = Utils.formatDate(date)

        return{
            description,
            amount,
            date
        }
    },

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    //Salvar uma nova transação
    submit(event){
        event.preventDefault()

        try{
            // verificar se todas as informações foram preenchidas
            Form.validateFields()
            // formatar os dados para salvar
            const transaction = Form.formatValues()
            // salvar 
            Transaction.add(transaction)
            // apagar os dados do formulario 
            Form.clearFields()
            // modal feche
            Modal.close()
            //atualizar a aplicação 
            //ja existe um app.reload no add
        }catch(error){
            alert(error.message)
        }
    }
}

const App = {
    init(){
        Transaction.all.forEach((transaction,index) =>{
            DOM.addTransaction(transaction,index)
        })
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransaction()
        App.init()
    },
}

App.init()

