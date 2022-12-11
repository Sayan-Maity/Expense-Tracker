//BUDGET CONTROLLER
var budgetController = (function() {
      
    //func constructors - privates
     var Expense = function(id, description, value) {
         this.id = id;
         this.description = description;
         this.value = value;
         this.percentage = -1;
     };
     
   Expense.prototype.calcPercentage = function (totalIncome) {
       if (totalIncome > 0) {
           this.percentage = Math.round((this.value / totalIncome) * 100);
       } else {
           this.percentage = -1;
       }

   };

   Expense.prototype.getPercentage = function() {
           return this.percentage;
   };

   var Income = function(id, description, value) {
       this.id = id;
       this.description = description;
       this.value = value;
   };

    var calculateTotal = function(type) {
          var sum = 0;
          data.allItems[type].forEach(function(cur) {
               sum = sum + cur.value;
          });
          data.totals[type] = sum;
    } ;

    var data = { //data structure
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage: -1
    };

    // public methods
    return {
        addItems: function(type, des, val) {
           var newItem, ID;

            //create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

           // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type == 'inc') {
                newItem = new Income(ID, des, val);
            }
           
            // push it into our data structure
           data.allItems[type].push(newItem);

           // return the new element
           return newItem;
        },

        deleteItem: function(type, id) {

             var ids, index;
             ids = data.allItems[type].map(function(current) {
                 return current.id;
             });

             index = ids.indexOf(id);

             if(index !== -1) { //if index is present
                 data.allItems[type].splice(index, 1); //delete 1 element at index
             }
        },

        calculateBudget: function() {

           // calculate total income and expenses
           calculateTotal('exp');
           calculateTotal('inc');

           //calculate the budget: income - expenses
           data.budget = data.totals.inc - data.totals.exp; 

           //calculate the percentage of income 
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {

             data.allItems.exp.forEach(function(cur) {
                 cur.calcPercentage(data.totals.inc);
             });
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });

            return allPerc;
        },

        getBudget: function() {
             return {
                 budget: data.budget,
                 totalInc: data.totals.inc,
                 totalExp: data.totals.exp,
                 percentage: data.percentage
             }
        },
        
    };

})();


/************************************************************************************************************** */

// UI CONTROLLER
var UIController = (function(){
   
   var DOMstrings = {
       inputType: '.add__type',
       inputDescription: '.add__description',
       inputValue: '.add__value',
       inputBtn: '.add__btn',
       incomeContainer: '.income__list',
       expensesContainer: '.expenses__list',
       budgetLabel: '.budget__value',
       incomeLabel: '.budget__income--value',
       expensesLabel: '.budget__expenses--value',
       percentageLabel: '.budget__expenses--percentage',
       container: '.container',
       expensesPercLabel: '.item__percentage',
       dateLabel:'.budget__title--month'

   };

   var formatNumber= function(num, type) {
       var numsplit, int, dec, type;
       /*
        or - before number
        exactly 2 decimal points
        comma separating */

        num = Math.abs(num);
        num = num.toFixed(2); //2 decimal places

        numsplit = num.split('.');

        int = numsplit[0];
        if(int.length > 3) {
           int = int.substr(0,int.length-3) + ',' + int.substr(int.length-3,3); //2,310
        }

        dec = numsplit[1];
       

        return  (type === 'exp' ? '-' :  '+') + ' ' + int + '.' + dec;

   };

   var nodeListForEach = function(list, callback) {
       for(var i=0; i< list.length; i++) {
           callback(list[i], i);
       }
   }
      return { 

          getInput: function() { // returning inputs
              return {
               type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
               description: document.querySelector(DOMstrings.inputDescription).value,
               value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
              };
          },
          
          addListItem: function(obj, type) {
                
              var html, newHtml, element;
              // create HTML string with placeholder text

              if (type === 'inc') {
                  element = DOMstrings.incomeContainer;

                  html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="far fa-check-circle"></i></button> </div></div></div>';
              } else if (type === 'exp') {
                  element = DOMstrings.expensesContainer;

                  html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="far fa-check-circle"></i></button></div></div></div>';
              }

               //Replace the placeholder text with some actual data
               newHtml = html.replace('%id%', obj.id);
               newHtml = newHtml.replace('%description%', obj.description);
               newHtml = newHtml.replace('%value%', formatNumber (obj.value,type));

               // Insert the HTML into the DOM
               document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
          },

          deleteListItem: function(selectorID){
              var el = document.getElementById(selectorID);
               el.parentNode.removeChild(el);
          },

          clearFields: function() {
              var fields, fieldArr;

              fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
              
             var fieldArr =  Array.prototype.slice.call(fields); // classConstructor.function.call(obj)

             fieldArr.forEach(function(current, index, array) { // loop or each ele in arr
                       
                   current.value = "";
             });

             //sets focus on 1st element - (decription)
             fieldArr[0].focus();

           },
           
          displayBudget: function(obj) {

               var type;
               obj.budget > 0 ? type = 'inc' : type = 'exp';

               document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
               document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
               document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
               

               if(obj.percentage > 0){
                   document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
               } else {
                   document.querySelector(DOMstrings.percentageLabel).textContent = '---'; 
               }
          },

          displayPercentages: function(percentages) {
              
              var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
                 
                
              nodeListForEach(fields, function (current, index) { // passing callback func

                  if (percentages[index] > 0) {
                      current.textContent = percentages[index] + '%';
                  } else {
                      current.textContent = '---';
                  }
              });
          },

          displayMonth: function () {

              var now, year,month,months;

              now = new Date();
              months = ['January', 'February','March','April','May','June','July','August',
              'September','October','November','December'];
              month = now.getMonth();
              year = now.getFullYear();
              
              document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

          },
          
          changedType: function() {
                var fields = document.querySelectorAll(
                    DOMstrings.inputType + ',' +
                    DOMstrings.inputDescription + ',' +
                    DOMstrings.inputValue);
                
               nodeListForEach(fields, function(cur ) {
                   cur.classList.toggle('red-focus');
               });

               document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
          },

          getDOMstrings: function() {
              return DOMstrings;
          }
      };
})();


/************************************************************************************************** */
// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UIctrl){

   var setupEventListners = function() { // handling events
       
       var DOM = UIctrl.getDOMstrings();

       document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

       document.addEventListener('keypress', function (event) {

           if (event.keyCode === 13 || event.which === 13) {
               //console.log('Enter key pressed');
               ctrlAddItem();
           }

       });

       document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

       document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType);
   };
  
   var updateBudge = function() {
       
       //1. calculate the budget
       budgetCtrl.calculateBudget();

       //2. return the budget
       var budget = budgetCtrl.getBudget();

       //3. Display the budget on the UI
       UIctrl.displayBudget(budget);


   };
   
   var updatePercentages = function() {
         
       //1. calculate percentages
       budgetCtrl.calculatePercentages();

       //2. read percentages from the budget controller
       var percentages = budgetCtrl.getPercentages();

       //3.update the UI with the new percentages
       UIctrl.displayPercentages(percentages);

   };

   var ctrlAddItem = function() {
       
       var input, newItem;
       // 1. Get the filled input data
       input = UIctrl.getInput();
       
       if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
           //2. Add the item to the budget controller
           newItem = budgetCtrl.addItems(input.type, input.description, input.value);

           // 3. Add the item to the UI
           UIctrl.addListItem(newItem, input.type);

           //4. Clear the fields
           UIController.clearFields();

           // 5. Calculate and update the budget 
           updateBudge();

           //6.calculate and update percentages
           updatePercentages();
       }
        

   };
   
   var ctrlDeleteItem = function(event) {
           
       var itemID,splitID,ID;

       //DOM structure traversing
       itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

       if(itemID ) {
         
           //inc-1 
           splitID = itemID.split('-'); // inc-1 from HTML
           type = splitID[0];
           ID = parseInt(splitID[1]);

           //1. delete the item from the data structure
           budgetCtrl.deleteItem(type, ID);

           //2. Delete the item from the UI
           UIctrl.deleteListItem(itemID);

           //3. Update and show the new budget
           updateBudge();

           //4.calculate and update percentages
           updatePercentages();
            
       }
   };

   return {
       init: function() {
           UIctrl.displayMonth();
           UIctrl.displayBudget({
               budget: 0,
               totalInc: 0,
               totalExp: 0,
               percentage: -1
           });
           setupEventListners();
       }
   }
   
    
})(budgetController, UIController);


//initializer
controller.init();