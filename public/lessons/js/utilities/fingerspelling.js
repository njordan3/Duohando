export class FingerSpelling {
    static count = 1;
    static #ASL = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    template = `
    <div class="mySlides fade">
        <div class="slide">
            <div class="fs-ASL-bank"></div>
            <div class="fs-ASL-answer-bank"></div>
        </div>
    </div>`;
    images = [];
    answers;
    constructor(phrase) {
        this.phrase = phrase;
        this.id = FingerSpelling.count++;
        this.done = false;
    }

    setUp() {
        document.getElementsByClassName(`fs-ASL-bank`)[this.id-1].id = `fs-ASL-bank-${this.id}`;
        document.getElementsByClassName(`fs-ASL-answer-bank`)[this.id-1].id = `fs-ASL-answer-bank-${this.id}`;

        var ASL_answer_bank = document.getElementsByClassName(`fs-ASL-answer-bank`)[this.id-1];
        var that = this;
    
        //loading the assets
        var promises = [];
        for (let i = 0; i < FingerSpelling.#ASL.length; i++) {
            promises.push(
                new Promise((resolve, reject) => {
                    this.images.push(new Image());
                    this.images[i].src = `/lessons/assets/${FingerSpelling.#ASL[i]}.png`
                    this.images[i].onload = function() {
                        resolve(true);
                    }
                })
            );
        }
        Promise.all(promises).then(result => {
            console.log("Finger Spelling ASL Assets loaded!");
    
            //build answer bank
            ASL_answer_bank.innerHTML = this.#buildHTML("answers");
            ASL_answer_bank.ondrop = function(e) { that.#drop(e); }
            ASL_answer_bank.ondragover = function(e) { that.#allowDrop(e); }
    
            //build ASL bank with images
            this.#resetASLBank();
    
            //get answer boxes
            this.answers = ASL_answer_bank.querySelectorAll(".fs-ASL-bank-answer");
        });
    }

    #buildHTML(type) {
        var html = "";
        //fill out ASL bank
        if (type === "bank") {
            for (let i = 0; i < this.images.length; i++) {
                if (document.getElementById(`fs-${FingerSpelling.#ASL[i]}`) === null) {
                html += `<img class="fs-ASL-image" id="fs-${FingerSpelling.#ASL[i]}" src="${this.images[i].src}" draggable="true">`;
                } else {
                    let count = 1;
                    while(document.getElementById(`fs-${FingerSpelling.#ASL[i]}${count}`) !== null) { count++; }
                    html += `<img class="fs-ASL-image" id="fs-${FingerSpelling.#ASL[i]}${count}" src="${this.images[i].src}" draggable="true">`;
                }
                
            }
        //fill out answer bank
        } else if (type === "answers") {
            let duplicates = {};
            for (let i = 0; i < this.phrase.length; i++) {
                for (let j = 0; j < this.phrase[i].length; j++) {
                    let id = "";
                    if (document.getElementById(`fs-box${this.phrase[i][j]}`) !== null) {
                        if (duplicates[this.phrase[i][j]] === undefined) {
                            duplicates[this.phrase[i][j]] = {count: 1};
                        } else {
                            duplicates[this.phrase[i][j]].count++;
                        }
                        id = `${this.phrase[i][j]}${duplicates[this.phrase[i][j]].count}`;
                    } else {
                        id = this.phrase[i][j];
                    }
                    html += `<div class="fs-ASL-bank-answer" id="fs-box${id}"></div>`;
                }
                html += `<div class="break"></div>`;
            }
        }
        return html;
    }

    #resetASLBank() {
        let that = this;
        let ASL_bank = document.getElementsByClassName(`fs-ASL-bank`)[this.id-1];
        let ASL_answer_bank = document.getElementsByClassName(`fs-ASL-answer-bank`)[this.id-1];
        ASL_bank.innerHTML = "";
        ASL_bank.innerHTML = this.#buildHTML("bank");
        ASL_bank.ondrop = function(e) { that.#drop(e); }
        ASL_bank.ondragover = function(e) { that.#allowDrop(e); }

        let temp1 = ASL_bank.querySelectorAll('.fs-ASL-image');
        let temp2 = ASL_answer_bank.querySelectorAll('.fs-ASL-image');
        for(let i = 0; i < temp1.length; i++) { temp1[i].ondragstart = function(e) { that.#drag(e); }; temp1[i].style.width = "auto"; temp1[i].style.height = "100px"; }
        for(let i = 0; i < temp2.length; i++) { temp2[i].ondragstart = function(e) { that.#drag(e); }; temp2[i].style.width = "auto"; temp2[i].style.height = "100px"; }
        //resize images to fit better on screen
    }

    #allowDrop(ev) {
        ev.preventDefault();
    }
    
    #drag(ev) {
        ev.dataTransfer.setData("phrase", ev.target.id+","+ev.target.parentNode.id);
    }

    #drop(ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("phrase");
        data = data.split(","); //[0] = dragged element's ID, [1] = dragged element's parent ID
        
        var drag_target = document.getElementById(data[0]);         //what element is being dragged
        var drag_parent = document.getElementById(data[1]);         //where the dragged element came from
        var drop_target = document.getElementById(ev.target.id);    //where the dragged element is going

        if (/fs-box/.test(drop_target.parentNode.id)) {   //check if the drop target is an image inside an answer box
            this.#swapElements(drag_target, drop_target, drag_parent);
            drag_target.parentNode.style.width = drag_target.style.width;
        } else if (drop_target.parentNode.id === `fs-ASL-answer-bank-${this.id}`) {   //check if the drop target is an answer box inside the answer bank
            var flags = drop_target.id.split("|");  //[0] = id, [1] = filled flag
            if (flags[1] === "filled") {    //answer box is already filled
                this.#swapElements(drag_target, drop_target.childNodes[0], drag_parent);
                drag_target.parentNode.style.width = drag_target.style.width;
            } else {    //answer box is empty
                if (drag_target !== null) {
                    drop_target.id = drop_target.id+"|filled";
                    drop_target.appendChild(drag_target);
                    if (/filled/.test(drag_parent.id)) {  //reset parent id to not include 'filled'
                        drag_parent.id = drag_parent.id.substring(0, drag_parent.id.length-7);
                    }
                    drag_target.parentNode.style.width = drag_target.style.width;
                }
            }
        } else if (drop_target.parentNode.id === `fs-ASL-bank-${this.id}`) {  //check if the drop target is an image inside the bank
            if (drag_parent.id !== `fs-ASL-bank-${this.id}`)
                this.#swapElements(drag_target, drop_target, drag_parent);
        } else if (drop_target.id === `fs-ASL-bank-${this.id}`) {     //check if the drop target is the bank
            if (drag_parent.id !== `fs-ASL-bank-${this.id}`) {    //do nothing if the drag parent and drop target are both the bank
                drop_target.appendChild(drag_target);
                if (/filled/.test(drag_parent.id))  //reset parent id to not include 'filled'
                    drag_parent.id = drag_parent.id.substring(0, drag_parent.id.length-7);
            }
        }
        this.#resetASLBank();
        this.#checkAnswers();
    }

    #swapElements(drag, drop, parent) {
        var temp = drop.parentNode.id;
        parent.appendChild(drop);
        document.getElementById(temp).appendChild(drag);
    }

    #checkAnswers() {
        let letters_correct = 0;
        for (let i = 0; i < this.answers.length; i++) {
            if (this.answers[i].id.charAt(6).toUpperCase() === this.answers[i].childNodes[0]?.id.charAt(3)) {
                letters_correct++;
            }
        }
        this.done = (letters_correct === this.answers.length);
        console.log(this.done);
    }
}