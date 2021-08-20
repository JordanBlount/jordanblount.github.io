let test = () => {
    let i = 0;
    let max = 50;
    let stackArr = [];
    let stacks = [];
    for(let x = 0; x < max; x++) {
        if(i === (10)) { // Acounts for how arrays work
            i = 0;
            stacks.push(stackArr);
            stackArr = [];
        }
        if(x === max - 1) {
            stacks.push(stackArr);
        }
        stackArr.push(x);
        i++;  
    }

    let size = 3;
    let split = [];
    for (let i = 0;  i < stacks.length; i += size) {
        split.push(stacks.slice(i, i + size))
    }
    
    console.log(split[0][0]);
}

test();

let randomBtn = document.querySelector("#btn");

randomBtn.addEventListener('click', someFunction, { once: true});

let someFunction = () => {

}