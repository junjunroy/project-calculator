const screenDisplay = document.querySelector(".calc-display>span");
screenDisplay.textContent = 0;
const topBtnContainer = document.querySelector(".top-btns");
const numBtnContainer = document.querySelector(".numpad");
const optrBtnContainer = document.querySelector(".optr");

//global variables
let num1 = null;
let num2 = null;
let operator = null;
//last button pressed whether number or operator; true when number
let numMode = false;

function reset(){
    num1 = null;
    num2 = null;
    if(operator){
        operator.classList.remove("the-optr");
    }
    operator = null;
}

//main UI creation function
function createButtons() {
    createTopButtons();
    createNumpad();
    createOperations();
}

//#region TOPBUTTON FUNCTIONALITIES
function createTopButtons(){
    const TOP_BUTTON = ["+/-", "A/C"];
    for(let i = 0; i < 2; i++){
        let newTopBtn = document.createElement("button");
        newTopBtn.classList.add("top-btn");
        newTopBtn.textContent = TOP_BUTTON[i];
        topBtnContainer.append(newTopBtn);
    }
    addTobButtonFunctions();
}

function addTobButtonFunctions(){
    const signBtn = document.querySelector(".top-btn:first-child");
    const clearBtn = document.querySelector(".top-btn:last-child");
    
    signBtn.addEventListener("click", () => {
        let input = screenDisplay.textContent;
        if(isValidInput(input)){
            input > 0 ? screenDisplay.textContent = "-" + input : screenDisplay.textContent = input.substring(1);
        }
    });

    clearBtn.addEventListener("click", () => {
        screenDisplay.textContent = "0";
        unlockButtons();
        reset();
    });
}
//#endregion

//#region NUMPAD FUNCTIONALITIES
function createNumpad() {
    const NUMPAD_DIGITS = ["7", "8", "9", "4", "5", "6", "1", "2", "3", "0", "00"]
    let newNumpadRow = document.createElement("div");
    newNumpadRow.classList.add("numpad-row");

    for(let i = 0; i < NUMPAD_DIGITS.length; i++){
        let newNumpadBtn = document.createElement("button");
        newNumpadBtn.classList.add("numpad-btn");
        newNumpadBtn.textContent = NUMPAD_DIGITS[i];
        addActionToDisplay(newNumpadBtn, NUMPAD_DIGITS[i]);

        newNumpadRow.append(newNumpadBtn);

        //adds each row of the numpad that completes a 4x3 grid (except the decimal)
        if((i+1) % 3 == 0 || i == NUMPAD_DIGITS.length - 1){
            numBtnContainer.append(newNumpadRow);
            newNumpadRow = document.createElement("div");
            newNumpadRow.classList.add("numpad-row");
        }
    }
    numBtnContainer.lastChild.appendChild(generateDecimalButton());
}

//solely for creating decimal button with it's functionalities and returns it
function generateDecimalButton() {
    const decimalBtn = document.createElement("button");
    decimalBtn.textContent = ".";
    decimalBtn.classList.add("numpad-btn");

    decimalBtn.addEventListener("click", () => {
        decimalBtn.classList.toggle("disabled")? decimalBtn.disabled = true: decimalBtn.disabled = false;
    });

    addActionToDisplay(decimalBtn, ".");
    return decimalBtn;
}

//only numbers are displayed
function addActionToDisplay(button, toDisplay) {
    button.addEventListener("click", ()=>{
        if(operator){
            operator.classList.remove("the-optr");//removes green light
        }
        if(Number(screenDisplay.textContent) == 0 || !numMode){
            screenDisplay.textContent = '';
            numMode = true;
        }
        screenDisplay.textContent += toDisplay;
    });
}
//#endregion

//#region OPERATOR FUNCTIONALITIES
function createOperations() {
    const BASIC_OPERATORS = ["÷", "x", "−", "+"];
    const OTHER_OPERATORS = ["del", "%", "√", "="];

    const leftOptrContainer = document.createElement("div");
    leftOptrContainer.classList.add("optr-left");
    const rightOptrContainer = document.createElement("div");
    rightOptrContainer.classList.add("optr-right");

    createOptrBtn(BASIC_OPERATORS, leftOptrContainer, true);
    createOptrBtn(OTHER_OPERATORS, rightOptrContainer, false);

    optrBtnContainer.appendChild(leftOptrContainer);
    optrBtnContainer.appendChild(rightOptrContainer);
}

//isBasic argument defines if buttons to be created are the Basic Operators
function createOptrBtn(arrOfBtns, optrContainer, isBasic) {
    for(optr of arrOfBtns){
        let optrBtn = document.createElement("button");
        optrBtn.id = optr;

        if(isBasic){
            addBasicOptrFunctions(optrBtn);
        }else{
            addOtherOptrFunctions(optrBtn);
        }

        arrOfBtns.indexOf(optr) == arrOfBtns.length - 1 ?
            optrBtn.classList.add("optr-btn-big"): optrBtn.classList.add("optr-btn");//changes the sizes of the + and = buttons
        optrBtn.textContent = optr;
        optrContainer.appendChild(optrBtn);
    }
}

function addBasicOptrFunctions(button) {
    button.addEventListener("click", () => {
        try{
            if(numMode && num1 != null){
                num2 = screenDisplay.textContent;
                screenDisplay.textContent = operate(num1, num2, operator);
                reset();
            }
            
            //allows changing of operator
            if(operator){
                operator.classList.remove("the-optr");
            }
            numMode = false;//the operator is pressed
            num1 = screenDisplay.textContent;
            operator = button;
            operator.classList.add("the-optr");
        }catch(err){
            if(operator){
                operator.classList.remove("the-optr");
            }
            screenDisplay.textContent = err;
            lockButtons();
        }
    });
}

function addOtherOptrFunctions(button) {
    button.addEventListener("click", () => {
        try{
            switch(button.id){
                case "del":
                    screenDisplay.textContent = screenDisplay.textContent.slice(0, -1);
                    if(screenDisplay.textContent.length == 0){
                        screenDisplay.textContent += 0;
                        reset();
                    }
                    break;
                case "%":
                    //add % function
                    break;
                case "√":
                    //add √ funciton
                    break;
                case "=":
                    num2 = screenDisplay.textContent;
                    screenDisplay.textContent = operate(num1, num2, operator);
                    numMode = false;
                    reset();
                    break;
            }
        }catch(err){
            screenDisplay.textContent = err;
            lockButtons();
        }
    });
}
//#endregion

function isValidInput(input){
    if(input == 0){
        return false;
    }
    return Number(input);
}

function operate(num1, num2, optr){
    if(num1 == null || optr == null || !numMode){
        throw "Syntax Error";
    }
    num1 = Number(num1);
    num2 = Number(num2);
    switch(optr.id){
        case "÷":
            if(num2 == 0){
                lockButtons();
                throw "Can't divide by 0"
            }
            return +parseFloat(num1/num2).toFixed(3);
        case "x":
            return num1*num2;
        case "−":
            return num1-num2;
        case "+":
            return num1+num2;
    }
}

function lockButtons(){
    const allButtons = document.querySelectorAll("button:not(.top-btn)");
    allButtons.forEach((button) => {
        button.disabled = true;
    });
}

function unlockButtons(){
    const allButtons = document.querySelectorAll("button:not(.top-btn)");
    allButtons.forEach((button) => {
        button.disabled = false;
    });
}

createButtons();