// все вкладки TabData
const tabs = [];

// TODO: Пофиксить баг: если быстро перейти на одну вкладку и обратно система думает что был дабл клик
// по вкладке
// наложение вкладок
// выделение слов как в вроде

// https://www.sohamkamani.com/javascript/enums/
// Enum. Статические члены класса не передаются его экземплярам. т.е. у TextDecoration.Bold 
// нельзя вызвать TextDecoration.Bold.Bold, зато у них есть свойство-строка type.
// Хотя эта строка не имеет значения
// Пример использования
// var tD =  TextDecoration.Bold
// switch (tD) {
//     case TextDecoration.Strike:
//         console.log("stike hard")
//         break;
//     case TextDecoration.Bold:
//         console.log("bold boy")
//         break;
// }


class TextDecorationType {
    // если справа ставить цифры то думаю это не сработает а пусть будет работать:
    // We can verify whether a particular variable is a Season enum
    // console.log(season instanceof Season)
    static Bold = new TextDecorationType("bold")
    static Strike = new TextDecorationType("strike")
    static Underline = new TextDecorationType("underline")
    static Italic = new TextDecorationType("italic")

    constructor(type) {
        this.type = type
    }
}

class TextDecorationData {
    constructor(textDecorationType, startPosition, endPosition) {
        this.textDecorationType = textDecorationType
        this.startPosition = startPosition
        this.endPosition = endPosition
    }

    static format(text) {
        // switch...
    }
}

// вкладка
class TabData {
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
    }

    // удаление заметки
    removeTask(uuid) {
        // удалить одну заметку по индексу uuid
        this.tasks.splice(uuid, 1);
        this.displayTasks();
        save();
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
        <button  id="tab_${this.uuid}" uuid=${this.uuid} 
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
                    selectTab(uuid);
                    // обрабатываем дабл клик
                    var now = new Date().getTime();
                    var lastClicked = sessionStorage.getItem(uuid);
                    if (lastClicked && (now - lastClicked < 450)) {
                        event.preventDefault(); // отменить стандартное действие
                        alert('uraa')
                    } else {
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

    //создать заметку для определённой вкладки
    displayTask(task) {
        var day = task.day;
        if (day < 10) {
            day = "0" + day;
        }

        var month = task.month + 1;
        if (month < 10) {
            month = "0" + month;
        }

        let format = task.value;
        format = format.replaceAll("\n", "<br>");
        if (task.bold) {
            format = '<b>' + format + '</b>';
        }
        if (task.strike) {
            format = '<strike>' + format + '</strike>';
        }
        if (task.underline) {
            format = '<u>' + format + '</u>';
        }
        if (task.italic) {
            format = '<i>' + format + '</i>';
        }
        context += format + "</span>";

        var context =
            `<div class="listElement" id="listElement_${task.uuid}">
            <span style="min-width: 9vh;" class="listElDate">${day}.${month}.${(task.year - 2000)}</span>
            <span class="listElText" id="listElText${task.uuid}" 
                style="min-width: 54vh; max-width: 54vh; color:${task.color}">
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
}


//заметка
class TaskData {
    constructor(date, value, stars, color, bold, strike, underline, italic) {
        //забей
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
        this.value = value;
        //звезды
        this.stars = stars;
        //форматирование
        this.color = color;
        this.bold = bold;
        this.strike = strike;
        this.underline = underline;
        this.italic = italic;
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
const taskInInputField = new TaskData(new Date(), "", 1, 'black', false, false, false, false);
// текущая вкладка
var selected = -1;

//сетап
$(document).ready(function () {
    load();
    selectTab(0);
    clickOnStar(3);
    $(".round").map(function () {
        this.style.background = this.getAttribute('color');
        return this;
    });
    updateTextArea();

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
});

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
    if (tabs.length < 10) {
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
    new TabData(('Вкладка ' + (++i)), []).displayTasks();
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
    let inp = $('#input_to_do');
    let text = inp.val();
    if (text.length > 0) {
        tabs[selected].tasks.push(new TaskData(new Date(), text, taskInInputField.stars,
            taskInInputField.color, taskInInputField.bold,
            taskInInputField.strike, taskInInputField.underline, taskInInputField.italic));
        tabs[selected].displayTasks();
        save();
    }
    inp.val('');
    setCorrectTaskInputHeights();
}


//изменить цвет
function changeColor(btn) {
    taskInInputField.color = btn.getAttribute('color');
    updateTextArea();
}

// пока нигде не используется
function getSelectionPositions() {
    var selectionObj = window.getSelection()

    // если выбрано окно ввода и есть выделение
    if (selectionObj.anchorNode == $('.user_input')[0] &&
        selectionObj.type == "Range") {
        console.log(input_to_do.selectionStart)
        console.log(input_to_do.selectionEnd)
    }
}


//изменить форматирование
function changeFont(i) {
    switch (i) {
        case 0: {
            taskInInputField.bold = !taskInInputField.bold;
            break;
        }
        case 1: {
            taskInInputField.strike = !taskInInputField.strike;
            break;
        }
        case 2: {
            taskInInputField.underline = !taskInInputField.underline;
            break;
        }
        case 3: {
            taskInInputField.italic = !taskInInputField.italic;
            break;
        }
    }
    updateTextArea();
}


//форматирование поле ввода
function updateTextArea() {
    let inp = $('#input_to_do');
    inp.css('color', taskInInputField.color);
    if (taskInInputField.bold) {
        inp.css('font-weight', 'bold');
    } else {
        inp.css('font-weight', '');
    }

    let decoration = '';
    if (taskInInputField.strike && taskInInputField.underline) {
        decoration = 'line-through underline';
    }
    if (!taskInInputField.strike && taskInInputField.underline) {
        decoration = 'underline';
    }
    if (taskInInputField.strike && !taskInInputField.underline) {
        decoration = 'line-through';
    }
    inp.css('text-decoration', decoration);

    if (taskInInputField.italic) {
        inp.css('font-style', 'italic');
    } else {
        inp.css('font-style', '');
    }
}

//загрузка
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
                task.value,
                task.stars,
                task.color,
                task.bold,
                task.strike,
                task.underline,
                task.italic
            );
            v.time = task.time;
            tabElements.push(v);
        })
        new TabData(tab.name, tabElements);
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
    // в user_input и inputPanel ещё нужно поставить : align-items: end
    var textarea = document.getElementById("input_to_do");
    textarea.oninput = setCorrectTaskInputHeights;
}

function setCorrectTaskInputHeights() {
    var limit = 200;
    var textarea = document.getElementById("input_to_do");
    textarea.style.height = "62px";
    textarea.style.height = Math.min(textarea.scrollHeight, limit) + "px";

    var inputPanel = document.getElementsByClassName("input-panel")[0];
    var newHeight = Math.min(textarea.scrollHeight - 14, limit) + 57;
    inputPanel.style.height = newHeight + "px";

}