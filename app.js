// BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    const calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (item) {
            sum += item.value;
        });
        data.totals[type] = sum;
    }

    let data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    }

    return {
        addItem: function (type, description, value) {
            let newItem, ID = 0;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            if (type === 'exp') {
                newItem = new Expense(ID, description, value);
            } else if (type === 'inc') {
                newItem = new Income(ID, description, value);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        calculateBudget: function () {
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages: function () {
            const totalIncome = data.totals.inc;
            data.allItems.exp.forEach(function (item) {
                item.calcPercentage(totalIncome);
            });
        },
        getPercentages: function () {
            let allPerc = data.allItems.exp.map(item => item.getPercentage());
            return allPerc;
        },
        getBudget: function () {
            return {
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
                budget: data.budget
            };
        },
        deleteItem: function (type, id) {
            let index = -1;
            data.allItems[type].map(function (item, ind) {
                if (item.id == id) {
                    index = ind;
                }
            });
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        testing: function () {
            console.log(data);
        }
    }

})();


// UI CONTROLLER
var UIController = (function () {

    const DOMStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        expenseContainer: ".expenses__list",
        incomeContainer: ".income__list",
        budgetValue: ".budget__value",
        budgetIncomeValue: ".budget__income--value",
        budgetExpensesValue: ".budget__expenses--value",
        budgetExpensesPerc: ".budget__expenses--percentage",
        itemPercentage: ".item__percentage",
        container: ".container",
        expensePercentage: ".item__percentage",
        month: ".budget__title--month",
    }

    function formatNumber(num, type) {
        num = num.toFixed(2);
        var numSplit = num.split('.');
        var int = numSplit[0];
        let res = '';
        if (int.length > 3) {
            let i = 3;
            for (i = 3; i < int.length; i += 3) {
                res = int.substr(-i, 3) + ',' + res;
            }
            if (i > int.length) {
                res = int.substr(0, int.length - (i - 3)) + ',' + res;
            }

            res = res.substring(0, res.length - 1) + '.' + numSplit[1];
        } else {
            res = num;
        }
        return (type === 'exp' ? '-' : '+') + res;
    }

    function nodeListForEach(fields, callback) {
        for (let i = 0; i < fields.length; i++) {
            callback(fields[i], i);
        }
    }

    return {
        getInput: function () {
            return {
                "type": document.querySelector(DOMStrings.inputType).value,
                "description": document.querySelector(DOMStrings.inputDescription).value,
                "value": parseFloat(document.querySelector(DOMStrings.inputValue).value),
            }
        },
        addListItem: function (type, item) {
            let html = '', element = '';
            if (type === 'inc') {
                html = `
                    <div class="item clearfix" id="inc-%id%">
                        <div class="item__description">%description%</div>
                        <div class="right clearfix">
                            <div class="item__value">%value%</div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>
                    </div>`;
                element = DOMStrings.incomeContainer;
            } else if (type === 'exp') {
                html = `
                    <div class="item clearfix" id="exp-%id%">
                        <div class="item__description">%description%</div>
                        <div class="right clearfix">
                            <div class="item__value">%value%</div>
                            <div class="item__percentage">0%</div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>
                    </div>
                `;
                element = DOMStrings.expenseContainer;
            }
            let newHtml = html.replace('%id%', item.id);
            newHtml = newHtml.replace('%description%', item.description);
            newHtml = newHtml.replace('%value%', formatNumber(item.value, type));
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        clearInput: function () {
            let fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            let fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (element) {
                element.value = '';
            });
            fieldsArr[0].focus();
        },
        getDOMStrings: function () {
            return DOMStrings;
        },
        displayBudget: function ({ budget, totalInc, totalExp, percentage }) {
            document.querySelector(DOMStrings.budgetValue).innerText = '+ ' + budget;
            document.querySelector(DOMStrings.budgetIncomeValue).innerText = '+ ' + totalInc;
            document.querySelector(DOMStrings.budgetExpensesValue).innerText = '- ' + totalExp;
            document.querySelector(DOMStrings.budgetExpensesPerc).innerText = percentage > 0 ? percentage + '%' : '---';
        },
        deleteistItem: function (type, id) {
            document.getElementById(type + '-' + id).remove();
        },
        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensePercentage);

            nodeListForEach(fields, function (field, index) {
                if (percentages[index] > 0) {
                    field.textContent = percentages[index] + '%';
                } else {
                    field.textContent = '---';
                }
            });
        },
        displayMonth: function () {
            var now = new Date();
            var year = now.getFullYear();
            var month = now.getMonth();
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            document.querySelector(DOMStrings.month).textContent = months[month] + ' ' + year;
        },
        changeType: function (e) {
            var fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + 
                DOMStrings.inputValue + ',' + 
                DOMStrings.inputType
            );
            nodeListForEach(fields, function (item, index) {
                item.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        }
    };

})();


// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    function setupEventListeners() {
        const DOMStrings = UICtrl.getDOMStrings();
        document.querySelector(DOMStrings.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOMStrings.container).addEventListener('click', ctrDeleteItem);
        document.querySelector(DOMStrings.inputType).addEventListener('change', UICtrl.changeType)
    }

    var updatePercentage = function () {
        budgetController.calculatePercentages();
        var percentages = budgetController.getPercentages();
        UICtrl.displayPercentages(percentages);
    }

    var updateBudget = function () {
        budgetCtrl.calculateBudget();
        const budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    }

    var ctrlAddItem = function () {
        const { type, description, value } = UICtrl.getInput();
        if (description !== '' && !isNaN(value) && value > 0) {
            const item = budgetController.addItem(type, description, value);
            updateBudget();
            UICtrl.addListItem(type, item);
            UICtrl.clearInput();
            updatePercentage();
        }
    }

    var ctrDeleteItem = function (e) {
        let itemElement = e.target.parentNode.parentNode.parentNode.parentNode;
        const itemElementId = itemElement.id.split('-');
        if (itemElementId.length === 2) {
            const type = itemElementId[0];
            const id = itemElementId[1];
            budgetController.deleteItem(type, id);
            budgetController.calculatePercentages();
            UICtrl.deleteistItem(type, id);
            updateBudget();
            updatePercentage();
        }
    }


    return {
        init: function () {
            setupEventListeners();
            UICtrl.displayBudget({
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
                budget: 0
            });
            UICtrl.displayMonth();
        }
    };

})(budgetController, UIController);

controller.init();