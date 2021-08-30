const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2021-01-18T21:31:17.178Z',
        '2021-02-23T07:42:02.383Z',
        '2021-02-28T09:15:04.904Z',
        '2021-05-01T10:17:24.185Z',
        '2021-08-08T14:11:59.604Z',
        '2021-08-27T17:01:17.194Z',
        '2021-08-28T23:36:17.929Z',
        '2021-08-30T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
}

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2019-12-25T06:04:23.907Z',
        '2020-01-25T14:18:46.235Z',
        '2020-02-05T16:33:06.386Z',
        '2020-04-10T14:43:26.374Z',
        '2020-06-25T18:49:59.371Z',
        '2020-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
}

const accounts = [account1, account2]

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome')
const labelDate = document.querySelector('.date')
const labelBalance = document.querySelector('.balance__value')
const labelSumIn = document.querySelector('.summary__value--in')
const labelSumOut = document.querySelector('.summary__value--out')
const labelSumInterest = document.querySelector('.summary__value--interest')
const labelTimer = document.querySelector('.timer')
const labelGetData = document.querySelector('.hardData')

const containerApp = document.querySelector('.app')
const containerMovements = document.querySelector('.movements')

const btnLogin = document.querySelector('.login__btn')
const btnTransfer = document.querySelector('.form__btn--transfer')
const btnLoan = document.querySelector('.form__btn--loan')
const btnClose = document.querySelector('.form__btn--close')
const btnSort = document.querySelector('.btn--sort')
const btnGetData = document.querySelector('.popUpbtn')
const btnClosePopUp = document.querySelector('.closePopUp')

const inputLoginUsername = document.querySelector('.login__input--user')
const inputLoginPin = document.querySelector('.login__input--pin')
const inputTransferTo = document.querySelector('.form__input--to')
const inputTransferAmount = document.querySelector('.form__input--amount')
const inputLoanAmount = document.querySelector('.form__input--loan-amount')
const inputCloseUsername = document.querySelector('.form__input--user')
const inputClosePin = document.querySelector('.form__input--pin')

/////////////////////////////////////////////////
// Functions

const formatCur = (value, currency) => {
    return new Intl.NumberFormat(navigator.language, {
        style: 'currency',
        currency: currency,
    }).format(value)
}

const formatMovementsDate = (TimeMovsDate) => {
    const calcDaysPassed = (date1, date2) => {
        return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24))
    }

    let daysPassed = calcDaysPassed(
        new Date().getTime(),
        TimeMovsDate.getTime()
    )

    if (daysPassed === 0) return 'Today'
    if (daysPassed === 1) return 'Yesterday'
    if (daysPassed <= 7) return `${daysPassed} days ago`
    else {
        let options = {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        }
        let local = navigator.language
        return new Intl.DateTimeFormat(local, options).format(TimeMovsDate)
    }
}

const displayMovements = function (acc, sort = false) {
    containerMovements.innerHTML = ''

    const movs = sort
        ? acc.movements.slice().sort((a, b) => a - b)
        : acc.movements

    movs.forEach(function (mov, i) {
        const type = mov > 0 ? 'deposit' : 'withdrawal'
        let TimeMovsDate = new Date(acc.movementsDates[i])
        let displayDate = formatMovementsDate(TimeMovsDate)

        let formattedMov = formatCur(mov, acc.currency)

        const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
            i + 1
        } ${type}</div>
        <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
        </div>
      `

        containerMovements.insertAdjacentHTML('afterbegin', html)
    })
}

const calcDisplayBalance = function (acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0)
    // let formattedMov = formatCur(acc.balance, acc.currency)

    labelBalance.textContent = formatCur(acc.balance, acc.currency)
}

const calcDisplaySummary = function (acc) {
    const incomes = acc.movements
        .filter((mov) => mov > 0)
        .reduce((acc, mov) => acc + mov, 0)
    labelSumIn.textContent = formatCur(incomes, acc.currency)

    const out = acc.movements
        .filter((mov) => mov < 0)
        .reduce((acc, mov) => acc + mov, 0)
    labelSumOut.textContent = formatCur(Math.abs(out), acc.currency)

    const interest = acc.movements
        .filter((mov) => mov > 0)
        .map((deposit) => (deposit * acc.interestRate) / 100)
        .filter((int, i, arr) => {
            // console.log(arr);
            return int >= 1
        })
        .reduce((acc, int) => acc + int, 0)
    labelSumInterest.textContent = formatCur(interest, acc.currency)
}

const createUsernames = function (accs) {
    accs.forEach(function (acc) {
        acc.username = acc.owner
            .toLowerCase()
            .split(' ')
            .map((name) => name[0])
            .join('')
    })
}
createUsernames(accounts)

const updateUI = function (acc) {
    // Display movements
    displayMovements(acc)

    // Display balance
    calcDisplayBalance(acc)

    // Display summary
    calcDisplaySummary(acc)
}

///////////////////////////////////////
// Event handlers

const startLogoutTimer = () => {
    let time = 120

    let tick = () => {
        let min = String(Math.trunc(time / 60)).padStart(2, 0)
        let sec = String(time % 60).padStart(2, 0)
        labelTimer.textContent = `${min}:${sec}`
        if (time === 0) {
            clearInterval(timer)
            labelWelcome.textContent = 'Login to get started'
            containerApp.style.opacity = 0
        }
        time--
    }

    tick()
    let timer = setInterval(tick, 1000)
    return timer
}

let currentAccount, timer
/////
btnClosePopUp.addEventListener('click', () => {
    labelGetData.classList.add('hidden')
    btnClosePopUp.classList.add('hidden')
})
btnGetData.addEventListener('click', () => {
    labelGetData.classList.remove('hidden')
    btnClosePopUp.classList.remove('hidden')
})
/////
btnLogin.addEventListener('click', function (e) {
    // Prevent form from submitting
    e.preventDefault()

    currentAccount = accounts.find(
        (acc) => acc.username === inputLoginUsername.value
    )
    console.log(currentAccount)

    if (currentAccount?.pin === +inputLoginPin.value) {
        // Display UI and message
        labelWelcome.textContent = `Welcome back, ${
            currentAccount.owner.split(' ')[0]
        }`
        containerApp.style.opacity = 100

        let now = new Date()
        let options = {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        }
        let local = navigator.language
        labelDate.textContent = new Intl.DateTimeFormat(local, options).format(
            now
        )

        // Clear input fields
        inputLoginUsername.value = inputLoginPin.value = ''
        inputLoginPin.blur()

        if (timer) clearInterval(timer)
        timer = startLogoutTimer()
        // Update UI
        updateUI(currentAccount)
    }
})

btnTransfer.addEventListener('click', function (e) {
    e.preventDefault()
    const amount = +inputTransferAmount.value
    const receiverAcc = accounts.find(
        (acc) => acc.username === inputTransferTo.value
    )
    inputTransferAmount.value = inputTransferTo.value = ''

    if (
        amount > 0 &&
        receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc?.username !== currentAccount.username
    ) {
        // Doing the transfer
        currentAccount.movements.push(-amount)
        receiverAcc.movements.push(amount)

        currentAccount.movementsDates.push(new Date().toISOString())
        receiverAcc.movementsDates.push(new Date().toISOString())

        // Update UI
        clearInterval(timer)
        timer = startLogoutTimer()
        updateUI(currentAccount)
    }
})

btnLoan.addEventListener('click', function (e) {
    e.preventDefault()

    const amount = Math.floor(inputLoanAmount.value)
    if (
        amount > 0 &&
        currentAccount.movements.some((mov) => mov >= amount * 0.1)
    ) {
        // Add movement
        setTimeout(() => {
            currentAccount.movements.push(amount)
            currentAccount.movementsDates.push(new Date())

            // Update UI
            clearInterval(timer)
            timer = startLogoutTimer()
            updateUI(currentAccount)
        }, 3000)
    }
    inputLoanAmount.value = ''
})

btnClose.addEventListener('click', function (e) {
    e.preventDefault()

    if (
        inputCloseUsername.value === currentAccount.username &&
        +inputClosePin.value === currentAccount.pin
    ) {
        const index = accounts.findIndex(
            (acc) => acc.username === currentAccount.username
        )
        console.log(index)
        // .indexOf(23)

        // Delete account
        accounts.splice(index, 1)

        // Hide UI
        containerApp.style.opacity = 0
    }

    inputCloseUsername.value = inputClosePin.value = ''
})

let sorted = false
btnSort.addEventListener('click', function (e) {
    e.preventDefault()

    displayMovements(currentAccount, !sorted)
    sorted = !sorted
})

labelBalance.addEventListener('click', () => {
    ;[...document.querySelectorAll('.movements__row')].forEach((row, i) => {
        if (i % 2 === 0) {
            row.style.backgroundColor = 'gray'
        }
    })
})
