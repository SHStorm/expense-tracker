const transactions = loadTransactions();

render();

const $newTransactionForm = document.getElementById('new-transaction-form');
$newTransactionForm.addEventListener('submit', event => {
    event.preventDefault();

    const transactionData = new FormData($newTransactionForm);
    const text = transactionData.get('text');
    const amount = Number(transactionData.get('amount'));

    addTransaction({ text, amount });

    $newTransactionForm.reset();
});

function loadTransactions() {
    const transactions = JSON.parse(localStorage.getItem('transactions'));

    if (transactions === null) {
        return [];
    }

    return transactions;
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function addTransaction({ text, amount }) {
    transactions.push({ text, amount });
    render();
    saveTransactions();
}

function deleteTransaction({ text, amount }) {
    const deletedTransactionIndex = transactions.findIndex(transaction => transaction.text === text && transaction.amount === amount);
    transactions.splice(deletedTransactionIndex, 1);

    render();
    saveTransactions();
}

function render() {
    renderTransactions();
    renderBalance();
}

function renderTransactions() {
    const $transactionHistory = document.getElementById('transaction-history');

    $transactionHistory.innerHTML = '';

    transactions.forEach(transaction => {
        $transactionHistory.appendChild(createTransactionDOM(transaction, { onDelete: deleteTransaction.bind(null, transaction) }));
    });
}

function renderBalance() {
    const $overallBalance = document.getElementById('overall-balance');
    const $overallIncome = document.getElementById('overall-income');
    const $overallExpenses = document.getElementById('overall-expenses');

    const overallIncome = transactions.reduce((overallIncome, { amount }) => amount > 0 ? overallIncome + amount : overallIncome, 0);
    const overallExpenses = transactions.reduce((overallExpenses, { amount }) => amount < 0 ? overallExpenses + Math.abs(amount) : overallExpenses, 0);
    const overallBalance = overallIncome - overallExpenses;

    renderMoney($overallIncome, overallIncome, 'NEVER');
    renderMoney($overallExpenses, overallExpenses, 'NEVER');
    renderMoney($overallBalance, overallBalance, 'ONLY_NEGATIVE');
}

function renderMoney($element, amount, signMode = 'ALWAYS') {
    $element.textContent = formatMoney(amount, signMode);
}

function createTransactionDOM({ text, amount }, { onDelete }) {
    const $transaction = document.createElement('li');
    $transaction.classList.add('transaction');
    $transaction.classList.add(amount >= 0 ? 'transaction-income' : 'transaction-expense');

    const $deleteButton = document.createElement('button');
    $deleteButton.classList.add('transaction-delete-button');
    $deleteButton.textContent = 'X';
    $deleteButton.addEventListener('click', () => {
        $transaction.remove();
        onDelete();
    });

    $transaction.appendChild($deleteButton);

    const $transactionText = document.createElement('p');
    $transactionText.textContent = text;

    $transaction.appendChild($transactionText);

    const $transactionAmount = document.createElement('p');
    $transactionAmount.textContent = getSignedNumber(amount);

    $transaction.appendChild($transactionAmount);

    return $transaction;
}

function formatMoney(amount, signMode = 'ALWAYS') {
    const base = `$${Math.abs(amount).toFixed(2)}`;
    const sign = getNumberSign(amount);

    if ((signMode === 'ALWAYS') || (signMode === 'ONLY_POSITIVE' && amount > 0) || (signMode === 'ONLY_NEGATIVE' && amount < 0)) {
        return sign + base;
    }

    return base;
}

function getSignedNumber(number) {
    return getNumberSign(number) + Math.abs(number);
}

function getNumberSign(number) {
    if (number > 0) {
        return '+';
    } else if (number < 0) {
        return '-';
    }

    return '';
}
