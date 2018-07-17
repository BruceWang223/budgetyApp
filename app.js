var budgetController = (function(){
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(total){
        if(total > 0)
            this.percentage = Math.round (this.value / total * 100);
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp:[],
            inc:[]
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(el){
            sum += el.value;
        });
        data.totals[type] = sum;
    }

    return {
        addItem: function(type,des,val){
            var newItem, ID;
            if(data.allItems[type].length >= 1)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;
            if(type === "exp"){
                newItem = new Expense(ID, des, val); 
            }
            else{
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        calculateBudget: function(){
            calculateTotal("inc");
            calculateTotal("exp");
            data.budget = data.totals['inc'] - data.totals['exp'];
            if(data.totals['inc'] > 0)
                data.percentage = Math.round(100 * data.totals['exp'] / data.totals['inc']);
            else
                data.percentage = -1;
        },
        calculatePercentage: function(){
            data.allItems["exp"].forEach(function(el){
                el.calculatePercentage(data.totals["inc"]);
            });
        },
        getPercentage: function(){
            var allPercentages = data.allItems["exp"].map(function(el){
                return el.getPercentage();
            });
            return allPercentages;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalsInc: data.totals["inc"],
                totalsExp: data.totals["exp"],
                percentage: data.percentage
            }
        },
        deleteItem: function(type, id){
            var ids = data.allItems[type].map(function(el){
                return el.id;
            })
            var pos = ids.indexOf(id);
            console.log(type, pos);
            if(pos !== -1){
                data.allItems[type].splice(pos,1);
            }
        },
        clearData: function(){
            data.allItems["exp"] = [];
            data.allItems["inc"] = [];
            data.totals["exp"] = 0;
            data.totals["inc"] = 0;
            data.budget = 0;
            data.percentage = -1;
        },
        testing: function(){
            console.log(data);
        }
    }



})();


var UIController = (function(){
    var type = document.querySelector(".add__type");
    var description = document.querySelector(".add__description");
    var value = document.querySelector(".add__value");

    var formatNumber = function(number,type){
        var sign;
        type === "exp" ? sign = '-' : sign = '+';
        number = number.toFixed(2);
        number = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return sign + " " + number;
    };

    return {
        getInput: function(){
            return{
                type: type.value,
                description: description.value,
                value: parseFloat(value.value)
            }
        },

        addListItem: function(obj, type){
            var html, newHTML, element;
            if(type === 'inc'){
                element = ".income__list";
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else{
                element = ".expenses__list";
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newHTML = html.replace("%id%", obj.id);
            newHTML = newHTML.replace("%description%", obj.description);
            newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
        },

        clearField: function(){
            var input = document.querySelectorAll("input");
            for(var i = 0; i < input.length; i++){
                input[i].value = '';
            }
            // document.getElementById("sel").selectedIndex = 0;
            document.querySelector(".add__description").focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type == "inc" : type == "exp";
            document.querySelector(".budget__value").textContent = formatNumber(obj.budget, type);
            document.querySelector(".budget__income--value").textContent = formatNumber(obj.totalsInc, "inc");
            document.querySelector(".budget__expenses--value").textContent = formatNumber(obj.totalsExp, "exp");
            if(obj.percentage > 0){
                document.querySelector(".budget__expenses--percentage").textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(".budget__expenses--percentage").textContent = '---';
            }
        },

        displayPercentage: function(arr){
            var fields = document.querySelectorAll(".item__percentage");
            for(var i = 0; i < fields.length; i++){
                if(arr[i] > 0)
                    fields[i].textContent = arr[i] + "%";
                else
                    fields[i].textContent = "---";
            }
        },
        displayTime: function(){
            var now = new Date();
            var year = now.getFullYear();
            var formatter = new Intl.DateTimeFormat("en", { month: "long" });
            var month = formatter.format(now);
            document.querySelector(".budget__title--month").textContent = month + " " + year;
        },
        deleteListItem: function(selectorID){
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        change: function(){
            var string = ".add__type,.add__description,.add__value";
            document.querySelectorAll(string).forEach(function(el){
                el.classList.toggle("red-focus");
            });
            document.querySelector(".add__btn").classList.toggle("red");
        },
        blur: function(){
           document.querySelector(".confirmDelete").classList.toggle("flex");
           document.querySelector(".top").classList.toggle("blur");
           document.querySelector(".bottom").classList.toggle("blur");
        }
    };

})();


var appController = (function(budgetCtrl, uiCtrl){
    var controlAddItem = function(){
        var input, newItem;
        // 1 read the input data;
        input = uiCtrl.getInput();

        if(input.description === '' || !input.description.replace(/\s/g, "")){
            document.querySelector(".add__description").focus();
            alert("Description is missing");
            return;
        } else if(isNaN(input.value) || !(input.value > 0)){
            document.querySelector(".add__value").focus();
            alert("Please enter a value above 0 in the field");
            return;
        } 
        // 2 Add the item to the budgetController
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        // 3 Add item to the UI;
        uiCtrl.addListItem(newItem, input.type);
        // 4 Clear field;
        uiCtrl.clearField();
        // 5 Calculate and update budget
        updateBudget();
        // 6. update percentages
        updatePercentage();
    };
        
    var updateBudget = function(){
        // 1. Calculate the budge;
        budgetCtrl.calculateBudget();
        // 2. Update the budget;
        var budget = budgetCtrl.getBudget();
        // 3. Show in the UICtrl
        uiCtrl.displayBudget(budget);
    };

    var updatePercentage = function(){
        budgetCtrl.calculatePercentage();
        var percentages = budgetCtrl.getPercentage();
        uiCtrl.displayPercentage(percentages);
    }

    var ctrlDeleteItem = function(event){
        var itemID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);
            // 1. delete item from the data structure,
            budgetCtrl.deleteItem(type, id);
            // 2. delete the item from UI,
            uiCtrl.deleteListItem(itemID);
            // 3. update budget
            updateBudget();
            // 4. update percentages
            updatePercentage();
        }
    };

    var ctrlDeleteAllItems = function(){
        if(document.querySelector("#yes").checked){
            document.querySelector(".income__list").innerHTML = "";
            document.querySelector(".expenses__list").innerHTML = "";
            budgetCtrl.clearData();
            updateBudget();
            updatePercentage();
        }
        uiCtrl.blur();
    }


    var setupEventListener = function(){
        var addButton = document.querySelector(".add__btn");
        addButton.addEventListener("click", controlAddItem);
        document.addEventListener("keypress",function(event){
            if(event.keyCode === 13 || event.which === 13){
                var length = document.querySelector(".confirmDelete").classList.length;
                if(length === 1){
                    controlAddItem();
                }
            }
        })
        document.addEventListener("keyup", function(event){
            if(event.keyCode === 13 || event.which === 13){
                var length = document.querySelector(".confirmDelete").classList.length;
                if(length === 2){
                    ctrlDeleteAllItems();
                }
            }
            if(event.keyCode === 27 || event.which === 27){
                uiCtrl.blur();
            }
        });
        document.querySelector(".container").addEventListener("click", ctrlDeleteItem);
        document.querySelector(".add__type").addEventListener("change", uiCtrl.change);
        document.querySelector(".delete__btn").addEventListener("click", uiCtrl.blur);
        document.querySelector(".delete__confirmBtn").addEventListener("click",ctrlDeleteAllItems);
    };

    return{
        init: function(){
            document.querySelector(".add__description").focus();
            console.log("event has started");
            setupEventListener();
            uiCtrl.displayTime();
            uiCtrl.displayBudget({
                budget: 0,
                totalsInc: 0,
                totalsExp: 0,
                percentage: -1
            })
        }
    }
    
})(budgetController, UIController);


appController.init();