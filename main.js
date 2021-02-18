let PLAYING = true;
let memory_cursor_index = 0;
let ide_cursor_index = 0;
let current_code = "";
let max_memory = 1000;
let memory = new Array(max_memory);
memory.fill(0);
let time_interval = 50;
let symbols = "+-.,[]<>";

function reset(){
    memory_cursor_index = 0;
    ide_cursor_index = 0;
    memory.fill(0);

    show_memory();
}

function play(){
    PLAYING = true;
    current_code = document.getElementById("code").value
    run().then();
}

function stop(){
    PLAYING = false;
}

function show_memory(){
    let memory_display = document.getElementById("memState");

    let s = ""
    for(let i = 0; i < memory.length ; i++){
        let tmp = memory[i].toString(16);
        let hex = (tmp.length===1?"0":"") + tmp
        hex = hex.toUpperCase();

        if(memory_cursor_index === i){
            s += "<span class='active'>" + hex + "</span> ";
        }else if(memory[i] !== 0){
            s += "<span class='used'>" + hex + "</span> ";
        }
        else {
            s += hex + " ";
        }
    }
    memory_display.innerHTML = s;
}

(function (){
    let speed_interval_input = document.getElementById("speed_tick");
    speed_interval_input.addEventListener("change", function (e) {
        let value = +speed_interval_input.value;
        if(value <= 1000 && value >= 0){
            time_interval = value;
            document.getElementById("speed").innerHTML = ""+value;
        }
    });

    let mem_size_input = document.getElementById("MemSize");
    mem_size_input.addEventListener("change", function (e){
        let new_size = +mem_size_input.value;
        if(new_size > 100){
            let size_diff = new_size - memory.length;
            if (size_diff < 0){
                for(let i=0;i<-size_diff;i++){
                    memory.pop();
                }
            }else {
                for(let i=0;i<size_diff;i++){
                    memory.push(0);
                }
            }
        }
    });

    show_memory();

    run().then(r => r);
})();

async function run(){
    while(PLAYING){
        if (ide_cursor_index === current_code.length){
            stop();
        }else{
            while(symbols.indexOf(current_code[ide_cursor_index]) === -1){
                ide_cursor_index++;
            }
            switch (current_code[ide_cursor_index]){
                case "+":
                    memory[memory_cursor_index] = (memory[memory_cursor_index]+1) % 256;
                    break;
                case "-":
                    memory[memory_cursor_index]--;
                    if(memory[memory_cursor_index] === -1)
                        memory[memory_cursor_index] = 255;
                    break;
                case ">":
                    memory_cursor_index = (memory_cursor_index+1) % memory.length;
                    break;
                case "<":
                    memory_cursor_index--;
                    if(memory_cursor_index === -1)
                        memory_cursor_index = memory.length
                    break;
                case ".":
                    //TODO output
                    document.getElementById("output").innerHTML += String.fromCharCode(memory[memory_cursor_index]);
                    break
                case ",":
                    let char = prompt("Enter the value");
                    if(char == null || char === "") {
                        console.log("No value found");
                    }else{
                        memory[memory_cursor_index] = char.charCodeAt(0);
                    }
                    break;
                case "[":
                    if(memory[memory_cursor_index] === 0){
                        let nested = 1;
                        ide_cursor_index++;
                        while(nested){
                            ide_cursor_index++;
                            if(current_code[ide_cursor_index] === "[")
                                nested++;
                            else if(current_code[ide_cursor_index] === "]")
                                nested--;
                        }
                    }
                    break;
                case "]":
                    if(memory[memory_cursor_index] !== 0){
                        let nested = 1;
                        ide_cursor_index--;
                        while(nested){
                            ide_cursor_index--;
                            if(current_code[ide_cursor_index] === "]")
                                nested++;
                            else if(current_code[ide_cursor_index] === "[")
                                nested--;
                        }
                    }
                    break;

            }
            ide_cursor_index++;
            show_memory()

            await new Promise(r=>setTimeout(r, time_interval));
        }
    }
}