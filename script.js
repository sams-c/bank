"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2024-05-10T17:01:17.194Z",
    "2024-05-11T23:36:17.929Z",
    "2024-05-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "GBP",
  locale: "en-GB",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");
const error = document.querySelector(".error");
const body = document.querySelector("body");

const moneyFormatter = function (money) {
  const locale = currentAccount.locale;
  const currency = currentAccount.currency;
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  });
  return formatter.format(money);
};

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = `Log in to get started`;
    }
    time--;
  };
  let time = 300;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

const displayMovement = function (acc, sort = false) {
  containerMovements.innerHTML = "";
  const sortMovs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  sortMovs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const formattedMov = moneyFormatter(mov);
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedMov}</div>
   </div>`;
    containerMovements.insertAdjacentHTML("afterbegin", html); //After begin makes new child elements appear above. afterend would make them appear below each child element
  });
};

const calcPrintBalance = function (acc) {
  const balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  acc.balance = balance;
  const formattedBal = moneyFormatter(balance);
  labelBalance.textContent = formattedBal;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  const formattedSum = moneyFormatter(incomes);
  labelSumIn.textContent = `${formattedSum}`;

  const outgoings = acc.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  const formattedOutgoings = moneyFormatter(outgoings);
  labelSumOut.textContent = formattedOutgoings.slice(1);

  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * acc.interestRate) / 100)
    .filter((int) => int >= 1)
    .reduce((acc, interest) => acc + interest, 0);
  const formattedInterest = moneyFormatter(interest);
  labelSumInterest.textContent = formattedInterest;
};

const createUsernames = function (accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};

const updateUI = function (acc) {
  displayMovement(acc);
  calcDisplaySummary(acc);
  calcPrintBalance(acc);
};

createUsernames(accounts);

let currentAccount, timer;

body.addEventListener("click", function () {
  if (currentAccount) {
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});
//FAKE ALWAYS LOGIN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener("click", function (event) {
  event.preventDefault();
  currentAccount = accounts.find(
    (acc) => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }`;
    labelWelcome.style.color = "Black";
    containerApp.style.opacity = 100;
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
    updateUI(currentAccount);

    const now = new Date();
    const options = {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
    //
    inputLoginUsername.value = inputLoginPin.value = "";
    inputLoginPin.blur();

    error.textContent = "";
  } else {
    error.textContent = `Wrong username or password`;
  }
});

btnTransfer.addEventListener("click", function (event) {
  event.preventDefault();
  const amount = +inputTransferAmount.value;
  const findAccount = accounts.find(
    (acc) => acc.owner === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = "";
  if (findAccount) {
    if (amount <= currentAccount.balance && amount > 0) {
      findAccount.movements.push(amount);
      currentAccount.movements.push(-amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      findAccount.movementsDates.push(new Date().toISOString());
      inputTransferTo.insertAdjacentHTML("beforebegin", "");
      error.textContent = "";
      updateUI(currentAccount);
      clearInterval(timer);
      timer = startLogoutTimer();
    } else {
      error.textContent = `Not enough funds`;
    }
  } else {
    error.textContent = `Wrong Name, please check again`;
  }
});

btnLoan.addEventListener("click", function (event) {
  event.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (
    amount > 0 &&
    currentAccount.movements.some((mov) => mov >= amount * 0.1)
  ) {
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount);
    }, 3000);
    error.textContent = "";
  } else {
    {
      error.textContent = `Refused Loan`;
    }
  }
  inputLoanAmount.value = "";
  clearInterval(timer);
  timer = startLogoutTimer();
});

btnClose.addEventListener("click", function (event) {
  event.preventDefault();

  if (
    currentAccount.pin === +inputClosePin.value &&
    currentAccount.username === inputCloseUsername.value
  ) {
    const index = accounts.findIndex(
      (acc) => acc.username === currentAccount.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Account Deleted`;
    labelWelcome.style.color = "Red";
    error.textContent = "";
  } else {
    error.textContent = `Wrong Username or Password Detected`;
  }
  inputCloseUsername.value = inputClosePin.value = "";
});

let sorted = false;

btnSort.addEventListener("click", function (event) {
  event.preventDefault();
  displayMovement(currentAccount, !sorted);
  sorted = !sorted;
});
