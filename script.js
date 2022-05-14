// все вкладки Tab
const tabs = [];


// TODO: Пофиксить баг: если быстро перейти на одну вкладку и обратно система думает что был дабл клик
// по вкладке

var maxTabNameLength = 20;
var tabsMaxCount = 10;
var maxTaskLength = 1000;

// вкладка
class Tab {
    constructor(name, elements) {
        this.uuid = tabs.length;
        //название вкладки
        this.name = name;
        //заметки
        this.tasks = elements;
        //автодобавление в массив
        tabs.push(this);
        //добавление html кнопку со вкладкой
        this.createTab(false);
    }

    //заполнение страницы заметками
    displayTasks() {
        // строка ниже не бесполезна
        $("#elements").html("");
        let i = 0;
        // строка ниже не бесполезна. сортирует this.tasks и даёт им uuid
        this.sort();

        this.tasks.forEach(task => {
            task.uuid = i;
            this.displayTask(task)
            // task.displayTask(tabs.findIndex( (tab) => tab == this));
            i++;
        });
        // нужно обновить массив taskTexts
        initTaskEdit()
    }

    // удаление заметки
    removeTask(uuid) {
        if (confirm("Удалить заметку?")) {
            // удалить одну заметку по индексу uuid
            this.tasks.splice(uuid, 1);
            this.displayTasks();
            save();
        }
    }

    // изменение звезд на заметке
    clickOnStar(uuid, id) {
        this.tasks[uuid].stars = id;
        this.displayTasks();
        save();
    }

    // кнопка со вкладкой
    createTab(selected) {
        var context = `
        <button  id="tab_${this.uuid}" uuid=${this.uuid} style="z-index: ${1000 - this.uuid};"
        class="tabs_item${selected ? ' tabs_selected': ''}">
            <p class="tab_text${selected ? " tab_selected_text" : ""}">
                ${this.name}
            </p>
        </button>`;
        $("#tabs").append(context);

        // обработка нажатия на вкладку
        $('#tab_' + this.uuid).mousedown(function (event) {
            let uuid = this.getAttribute('uuid');
            switch (event.which) {
                // если click
                case 1:
                    // если выбрали другую вкладку то удаляем инфомацию о времени кликов
                    // на другие вкладки
                    // if (uuid != selected)
                    //     sessionStorage.clear()
                    // обрабатываем дабл клик
                    var now = new Date().getTime();
                    var lastClicked = sessionStorage.getItem(uuid);
                    // console.log(sessionStorage)
                    if (lastClicked && (now - lastClicked < 450)) {
                        event.preventDefault(); // отменить стандартное действие
                        // вызываем статический метод класса Tab
                        // если убрать static и вызывать через this то 
                        // почему то выдаётся this.renameTab() is not a function
                        Tab.renameTab(this)
                        // $(this).replaceWith($('<input type="text" size="5">' + this.innerText));

                    } else {
                        selectTab(uuid);
                        // создаём запись в сессионное хранилище о времени клика на определённую
                        // вкладку
                        sessionStorage.setItem(uuid, now.toString())
                    }
                    break;
                    // если right click
                case 3:
                    let confir = confirm('Удалить вкладку ' + this.firstChild.innerHTML);
                    if (confir) {
                        deleteTab(uuid);
                    }
                    break;
            }
        });
    }

    //создать заметку для этой вкладки
    displayTask(task) {
        var day = task.day;
        if (day < 10) {
            day = "0" + day;
        }

        var month = task.month + 1;
        if (month < 10) {
            month = "0" + month;
        }

        let format = task.text;
        // где пользователь сам ставит перенос строки в тексте заметки
        // появляется \n
        format = format.replaceAll("\n", "<br>");

        var context =
            `<div class="listElement" id="listElement_${task.uuid}">
            <span style="min-width: 9vh;" class="listElDate">${day}.${month}.${(task.year - 2000)}</span>
            <span class="listElText" id="listElText${task.uuid}">
                ${format}
            </span>
            <div class="listElStars">
                ${task.fillStarts(this.uuid)}
            </div>
            <div class="trashImgDiv">
                <img class="trashImg" src="assets/trash.svg" alt="" 
                    onclick="removeTask(${this.uuid},${task.uuid})">
            </div>
        </div>`;

        $("#elements").append(context);
    }

    sort() {
        this.tasks.sort(TaskData.compare);
        let i = 0;
        this.tasks.forEach(el => {
            el.uuid = i;
            i++;
        });
    }

    static renameTab(tab) {
        changeTextWithInputField(tab.innerText, maxTabNameLength,
            (inputResult) => {
                let uuid = tab.getAttribute('uuid');
                tabs[uuid].name = getPlainText(inputResult)
                // сохранить новое название в local storage
                save()
                // костыль для того чтобы можно было увидеть только что сохранённое название вкладки
                selectTab(selected)
            }
        )
    }
}


function changeTextWithInputField(text, maxLength, callback) {
    var input = $('#input_to_do')
    // этот аттрибут не даст ввести больше n символов в инпут
    setCKEditorMaxLength(maxLength)
    // добавляем в инпут прежнее название вкладки
    window.editor.data.set(text)
    // ставим курсор в конец инпута
    window.editor.focus()
    // ставим курсор в конец инпута
    editor.model.change(writer => {
        writer.setSelection(writer.createPositionAt(editor.model.document.getRoot(), 'end'));
    });
    // JS находит на странице элемент с id enter_btn
    enter_btn.onclick = function () {
        // получаем текст из инпута без тегов
        var htmlText = editor.data.get()
        if (htmlText.length > 0) {
            window.editor.data.set('')
            setCKEditorMaxLength(maxTaskLength)
            // Возвращаем стандартное поведение клавиши энтер
            enter_btn.onclick = createTaskFromInput;
            callback(htmlText)
        }
    }
}


function getPlainText(htmlText) {
    var dom = document.createElement("DIV");
    dom.innerHTML = htmlText;
    var plain_text = (dom.textContent || dom.innerText);
    return plain_text;
}


//заметка
class TaskData {
    //textDecorations - TextDecorationData[]
    constructor(date, text, stars) {
        this.uuid = 0;
        //год
        this.year = date.getFullYear();
        //месяц
        this.month = date.getMonth();
        //день
        this.day = date.getDate();
        //для соритровки по времени
        this.time = date.getTime();
        //текст
        this.text = text;
        //звезды
        this.stars = stars;
    }


    // создание html елементов - картинок звёздочек
    fillStarts(tabId) {
        let context = "";
        for (var i = 0; i < 5; i++) {
            let arg =
                `<img class="starImg" alt="" 
                    onclick="clickOnStarElement(${tabId}, ${this.uuid}, ${i+1})" 
                    ${ i < this.stars? ' src="assets/paintedStar.svg"' : 
                    ' src="assets/star.svg"'}
                >`;
            context += arg;
        }
        return context;
    }

    // сортировка
    static compare(a, b) {
        if (a.stars > b.stars) {
            return -1;
        }
        if (a.stars < b.stars) {
            return 1;
        }

        if (a.time > b.time) {
            return -1;
        }
        if (a.time < b.time) {
            return 1;
        }
        return 0;
    }
}


// упрощение обработки и хранения данных новой заметки
const taskInInputField = new TaskData(new Date(), "", 1)
// текущая вкладка
var selected = -1;


//сетап
$(document).ready(function () {
    setCKEditorMaxLength(maxTaskLength)
    load();
    selectTab(0);
    clickOnStar(3);
    $(".round").map(function () {
        this.style.background = this.getAttribute('color');
    });

    // каждой появляющейся кнопке (иконки доп настроек) 
    // при наведении на значок доп настроек задаём функцию показать 
    // выпадающее меню настроек. 0ой кнопке - 0ое меню, 1ой кнопке - 1ое меню в html коде
    //  при наведении на значок настроек. .secondary-popup - выпадающее меню
    // .secondary-popup-hover-area - зона наведения если мышка на ней то отображаем .secondary-popup
    // эта зона наведения захватывает сам блок выпадающих настроек и пр-во между ним и 
    // значком доп настроек
    // снизу: получить все .ico-bloc (иконки доп настроек) находящиеся в .popup то есть выпадающие .ico-block
    var btns = document.querySelectorAll(".popup .ico-block");
    for (let index = 0; index < btns.length; index++) {
        // получаем иконку доп настроек
        var btn = btns[index];

        // получаем соответствующую кнопке зону. если курсор в этой зоне (захватывает выпадающее меню 
        // и пустое пр-во слева), оставляем выпадающее меню
        // эта зона всегда с display block. Но не всегда в ней display block с
        // выпадающим меню
        var secondaryPopupHoverArea = document.querySelectorAll(".secondary-popup-hover-area")[index];

        // при наведении на соответствующую кнопку отобразить соответствующее выпадающее меню
        // (выпадающее меню находится в блоке .secondary-popup-hover-area)
        btn.onmouseover = () => {
            var secondaryPopup = document.querySelectorAll(".secondary-popup")[index];
            secondaryPopup.style.display = 'block';
        }

        // если мы перенесли курсор с иконки доп настроек (btn) на выпадающее меню
        // (а точнее secondaryPopupHoverArea - зону с меню и пространством слева) то
        // продолжаем отображать (ставим display block) для соответствующего выпадающего меню
        // secondaryPopupHoverArea не конфиктуют как я понял потому что сжимаются когда в них не
        // отображается выпадающее меню
        secondaryPopupHoverArea.onmouseover = () => {
            var secondaryPopup = document.querySelectorAll(".secondary-popup")[index];
            secondaryPopup.style.display = 'block';
        }


        // если отводим курсор с иконки (не работает когда курсор в secondaryPopupHoverArea) тк
        // есть функция выше, то перестать отображать выпадающее меню
        btn.onmouseout = () => {
            var secondaryPopup = document.querySelectorAll(".secondary-popup")[index];
            secondaryPopup.style.display = 'none';
        }
    }
    setDinamicalInputExpand();
    // Воу, если я просто обращаюсь к enter_btn хотя такой переменной не существует
    // JS находит на странице элемент с id enter_btn
    enter_btn.onclick = createTaskFromInput;
    setColorActions();
    initTaskEdit()
});


// TODO fix star edit
function initTaskEdit() {
    // добавим возможность редактирования текстов заметок
    var taskTexts = document.querySelectorAll(".listElText");
    for (let index = 0; index < taskTexts.length; index++) {
        var taskText = taskTexts[index]
        taskText.onclick = function (event) {
            switch (event.which) {
                // если click
                case 1:
                    // обрабатываем дабл клик
                    var now = new Date().getTime();
                    var lastClicked = sessionStorage.getItem('task ' + index);
                    // console.log(sessionStorage)
                    if (lastClicked && (now - lastClicked < 450)) {
                        event.preventDefault(); // отменить стандартное действие
                        console.log('db click')
                        // устанавливаем в инпут филд кол-во звёзд таск
                        // clickOnStar(tabs[selected].tasks[index].stars)
                        changeTextWithInputField(taskTexts[index].innerHTML, maxTaskLength,
                            (inputResult) => {
                                tabs[selected].tasks[index].text = inputResult
                                tabs[selected].tasks[index].stars = taskInInputField.stars

                                save()
                                tabs[selected].displayTasks();
                                setCorrectTaskInputHeightsAndLength();
                                // нужно обновить массив taskTexts
                                initTaskEdit()
                            }
                        )
                    } else {
                        // создаём запись в сессионное хранилище о времени клика на определённую
                        // вкладку
                        sessionStorage.setItem('task ' + index, now.toString())
                    }
                    break;
            }
        };
    }
}


var settingsArea = document.getElementsByClassName("settings-buttons-container")[0];
var popupMenu = document.getElementsByClassName("popup")[0];
var inputPanel = document.getElementsByClassName("input-panel")[0];


settingsArea.onmouseover = () => {
    // включаем отображение
    popupMenu.style.display = 'block';
}


settingsArea.onmouseout = () => {
    popupMenu.style.display = 'none';
}


// функция добавляется в html через js
function removeTask(tabId, uuid) {
    tabs[tabId].removeTask(uuid)
}


//клик по звезде (id) на странице (tabId) в заметке (uuid)
function clickOnStarElement(tabId, uuid, id) {
    tabs[tabId].clickOnStar(uuid, id)
}


function setColorActions() {
    var colorButtons = document.getElementsByClassName("round")
    var colors = []
    for (let i = 0; i < colorButtons.length; i++) {
        var colorButton = colorButtons[i];
        var buttonColor = colorButton.getAttribute('color').toString()
        colors.push(buttonColor)
        colorButton.onclick = () => {
            // тут нельзя просто так поставить переменную buttonColor
            // тк она скорее всего хотя в ней и строка явл-ся пер-ой ссылочного типа
            // и всем кнопкам даётся одна и та же ссылка на одно значение, по итогу - чёрный
            editor.execute('fontColor', {
                value: `${colors[i]}`
            })
        }
    }
}


//изменить форматирование
function changeFont(i) {
    switch (i) {
        case 0: {
            editor.commands.get("bold").execute()
            break;
        }
        case 1: {
            editor.commands.get("strikethrough").execute()
            break;
        }
        case 2: {
            editor.commands.get("underline").execute()
            break;
        }
        case 3: {
            editor.commands.get("italic").execute()
            break;
        }
    }
}


// выбрать вкладку
function selectTab(tabId) {
    $("#tabs").html("");
    $("#elements").html("");
    selected = -1;
    tabs.forEach(tab => {
        if (tab.uuid == tabId) {
            tab.createTab(true);
            tab.displayTasks();
            selected = tabId;
        } else {
            tab.createTab(false);
        }
    });
    if (tabs.length < tabsMaxCount) {
        var context = '<button id="new_tab" class="tabs_item" onclick="createTab()"';
        if (tabs.length > 0) {
            context += 'style="margin-left: -10px;"';
        }
        context += '></button>';
        $("#tabs").append(context);
    }
}


//создать новую вкладку
function createTab() {
    $("#tabs").html("");
    $("#elements").html("");
    let i = 0;
    // Берём название стоящей слева вкладки а если эта вкладка первая
    // то возьмём Вкладка 0 тогда по алгоритму ниже первая вкладка будет
    // иметь название Вкладка 1
    var lastTabName = tabs.length > 0 ? tabs[tabs.length - 1].name : 'Вкладка 0';

    // Ищем вкладку с цифрой, отдельной группой выделяем само число после слова Вкладка
    var regex = /Вкладка (\d+)/
    if (regex.exec(lastTabName) != undefined) {
        //  i - число после слова Вкладка
        i = parseInt(regex.exec(lastTabName)[1])
    }
    new Tab(('Вкладка ' + (++i)), []).displayTasks();
    selectTab(tabs.length - 1);
    save();
}


//удалить вкладку
function deleteTab(uuid) {
    tabs.splice(uuid, 1);
    for (let i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        tab.uuid = i;
    }

    save();
    // если удалили вкладку которая выбрана то выбираем предыдующую
    // если удалили вкладку у которой порядковый номер был меньше чем у выбранной
    if (selected >= uuid) {
        // то новый её ид уменьшится на 1
        selectTab(--selected);
    } else {
        selectTab(selected);
    }
}


/** создание заметки */
//звезда новой заметки
function clickOnStar(id) {
    taskInInputField.stars = id;
    let inp = $('#star_input_div');
    inp.html('');
    let text = '';
    for (let index = 1; index <= 5; index++) {
        text += '<img class="input_star_img" is="star_' + index + '" alt="" onclick="clickOnStar(' + index + ')" src="assets/';
        if (index <= taskInInputField.stars) {
            text += 'paintedInputStar';
        } else {
            text += 'inputStar';
        }
        text += '.svg"/>';
    }
    inp.append(text);
}


//создать заметку
function createTaskFromInput() {
    if (tabs.length == 0) {
        createTab();
    }

    var taskTextWithDecorations = window.editor.data.get()
    if (taskTextWithDecorations.length > 0) {
        tabs[selected].tasks.push(new TaskData(new Date(), taskTextWithDecorations, taskInInputField.stars));
        tabs[selected].displayTasks();
        save();
    }
    window.editor.data.set('')
    setCorrectTaskInputHeightsAndLength();
}


//загрузка, явное указание типо загруженных объектов
function load() {
    var tabs = JSON.parse(window.localStorage.getItem("tasksData"));

    if (tabs == null) {
        return;
    }
    tabs.forEach((tab) => {
        let tabElements = [];
        tab.tasks.forEach((task) => {
            let d = date(task.year, task.month, task.day);
            let v = new TaskData(
                d,
                task.text,
                task.stars,
            );
            v.time = task.time;
            tabElements.push(v);
        })
        // строка ниже вызывает конструктор который добавяет 
        // новую вкладку в массив вкладок (и это не очень красиво)
        new Tab(tab.name, tabElements);
    });
    selectTab(0);
}


//сохранение
function save() {
    window.localStorage.setItem("tasksData", JSON.stringify(tabs));
}


//для чтения
function date(year, month, day) {
    return new Date(year, month, day, 0, 0, 0);
}


// динамическое расширение textarea
function setDinamicalInputExpand() {
    var myElement = document.getElementById("input_to_do");
    if (window.addEventListener) {
        // Normal browsers
        myElement.addEventListener('DOMSubtreeModified', setCorrectTaskInputHeightsAndLength, false);
    } else
    if (window.attachEvent) {
        // IE
        myElement.attachEvent('DOMSubtreeModified', setCorrectTaskInputHeightsAndLength);
    }

}


function setCorrectTaskInputHeightsAndLength() {
    var limit = 200;
    var textarea = document.getElementById("input_to_do");
    textarea.style.height = "62px";
    textarea.style.height = Math.min(textarea.scrollHeight, limit) + "px";

    var inputPanel = document.getElementsByClassName("input-panel")[0];
    var newHeight = Math.min(textarea.scrollHeight - 14, limit) + 57;
    inputPanel.style.height = newHeight + "px";

    setMaxInputLength()
}

function setMaxInputLength() {
    var inputLength = CKEditorStats.characters;
    var str = input_to_do.innerText;
    var spacesCount = inputLength - str.replace(/\s+/g, '').length;
    isLimitExceeded = (inputLength - spacesCount) > maxLength;
    enter_btn.toggleAttribute('disabled', isLimitExceeded);


    var editor = document.querySelector(".editor__editable, main .ck-editor[role='application'] .ck.ck-content, .ck.editor__editable[role='textbox'], .ck.ck-editor__editable[role='textbox'], .ck.editor[role='textbox']")
    if (isLimitExceeded) {
        editor.classList.add('overflow');
    } else {
        editor.classList.remove('overflow');
    }
}