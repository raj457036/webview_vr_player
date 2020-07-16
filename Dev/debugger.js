function errorMessage(value) {
    const para = document.createElement("p");
    const text = document.createTextNode(value);
    para.appendChild(text);
    para.classList.add('error', 'log-box');
    
    document.querySelector(".debugger .logs").prepend(para);

    if (value.toString() === "THREE.WebGLState:") {
        init();
    }

    console.errorLog(value);
    

}
function logMessage(value) {
    const para = document.createElement("p");
    const text = document.createTextNode(value);
    para.appendChild(text);
    para.classList.add('log', 'log-box');
    
    document.querySelector(".debugger .logs").prepend(para);
    console.norLog(value);
}
function infoMessage(value) {
    const para = document.createElement("p");
    const text = document.createTextNode(value);
    para.appendChild(text);
    para.classList.add('info', 'log-box');
    
    document.querySelector(".debugger .logs").prepend(para);
    console.infoLog(value);
}
function warnMessage(value) {
    const para = document.createElement("p");
    const text = document.createTextNode(value);
    para.appendChild(text);
    para.classList.add('warn', 'log-box');
    
    document.querySelector(".debugger .logs").prepend(para);
    console.warnLog(value);
}

function setupDebugger() {
    console.errorLog = console.error;
    console.norLog = console.log;
    console.infoLog = console.info;
    console.warnLog = console.warn;

    console.error = errorMessage;
    console.log = logMessage;
    console.info = infoMessage;
    console.warn = warnMessage;
    console.debug = logMessage;
    console.dirxml = logMessage;
}

function execute() {
    const value = document.querySelector(".inlog input").value;
    console.log(JSON.stringify(eval(value), null, 1));
}