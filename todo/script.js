// все вкладки TabData
const tabs = [];

// вкладка
class TabData {
    constructor(name, elements) {
        this.uuid = tabs.length;
        //название вкладки
        this.name = name;
        //заметки
        this.elements = elements;
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
        // строка ниже не бесполезна
        this.sort();

        this.elements.forEach(value => {
            value.uuid = i;
            value.displayTasks(this.uuid);
            i++;
        });
    }

    // удаление заметки
    removeTask(uuid) {
        this.elements.splice(uuid, 1);
        this.displayTasks();
        save();
    }

    // изменение звезд на заметке
    clickOnStar(uuid, id) {
        this.elements[uuid].stars = id;
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
                        event.preventDefault();
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

    // сортировка
    sort() {
        this.elements.sort(TaskData.compare);
        let i = 0;
        this.elements.forEach(el => {
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

    //создать заметку
    displayTasks(tab) {
        var context = '<div class="listElement" id="listElement_' + this.uuid + '">';

        //month
        var day = this.day;
        if (day < 10) {
            day = "0" + day;
        }

        var month = this.month + 1;
        if (month < 10) {
            month = "0" + month;
        }

        context +=
            `<span style="min-width: 9vh;" class="listElDate">${day}.${month}.${(this.year - 2000)}</span>`;

        context +=
            '<span class="listElText" id="listElText' +
            this.uuid +
            '" style="min-width: 54vh; max-width: 54vh; color:' +
            this.color +
            '";>';
        let format = this.value;
        format = format.replaceAll("\n", "<br>");
        if (this.bold) {
            format = '<b>' + format + '</b>';
        }
        if (this.strike) {
            format = '<strike>' + format + '</strike>';
        }
        if (this.underline) {
            format = '<u>' + format + '</u>';
        }
        if (this.italic) {
            format = '<i>' + format + '</i>';
        }
        context += format + "</span>";

        //stars
        context += '<div class="listElStars">';
        context += this.fillStarts(tab);
        context += "</div>";

        //trash
        context +=
            '<div class="trashImgDiv">' +
            '<img class="trashImg" src="assets/trash.svg" alt="" onclick="removeTask(' +
            tab +
            ',' +
            this.uuid +
            ')">' +
            "</div>";

        //end
        context += "</div>";
        $("#elements").append(context);
    }

    // метод разукрашивающий звезды
    fillStarts(tabId) {
        let context = "";
        for (var i = 0; i < 5; i++) {
            let arg =
                '<img class="starImg" alt="" onclick="clickOnStarElement(' +
                tabId +
                "," +
                this.uuid +
                "," +
                (i + 1) +
                ')" ';
            if (i < this.stars) {
                // заполненая звезда
                arg += 'src="assets/paintedStar.svg"';
            } else {
                // пустая звезда
                arg += 'src="assets/star.svg"';
            }
            arg += ">";
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
});

var settingsArea = document.getElementsByClassName("settings-buttons-container")[0];
var popupMenu = document.getElementsByClassName("popup")[0];
var inputPanel = document.getElementsByClassName("input-panel")[0];


settingsArea.onmouseover = () => {
    // включаем отображение
    popupMenu.style.display = 'block';
    // inputPanel.setAttribute("style", "height:97px");
}

settingsArea.onmouseout = () => {
    popupMenu.style.display = 'none';
    // inputPanel.setAttribute("style", "height:97px ");
}

//удалить заметку
function removeTask(tabId, uuid) {
    tabs.forEach((tab) => {
        if (tab.uuid == tabId) {
            tab.removeTask(uuid);
        }
    });
}

//клик по звезде (id) на странице (tabId) в заметке (uuid)
function clickOnStarElement(tabId, uuid, id) {
    tabs.forEach(tab => {
        if (tab.uuid == tabId) {
            tab.clickOnStar(uuid, id);
        }
    });
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
    tabs.forEach(el => {
        var tabName = el.name;
        var regex = /Вкладка (\d+)/
        console.log(tabName)
        if (regex.exec(tabName) != undefined)
            console.log(regex.exec(tabName))
    });
    new TabData(('Вкладка ' + (i + 1).toString()), []).displayTasks();
    selectTab(tabs.length - 1);
    save();
}


//удалить вкладку
function deleteTab(uuid) {
    tabs.splice(uuid,1);
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
function createElement1() {
    if (tabs.length == 0) {
        createTab();
    }
    let inp = $('#input_to_do');
    let text = inp.val();
    if (text.length > 0) {
        tabs[selected].elements.push(new TaskData(new Date(), text, taskInInputField.stars,
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
    while (elements.length > 0) {
        elements.pop();
    }
    items = JSON.parse(window.localStorage.getItem("toDo"));

    if (items == null) {
        return;
    }
    items.forEach((element) => {
        let tabElements = [];
        element.elements.forEach((element) => {
            let d = date(element.year, element.month, element.day);
            let v = new TaskData(
                d,
                element.value,
                element.stars,
                element.color,
                element.bold,
                element.strike,
                element.underline,
                element.italic
            );
            v.time = element.time;
            tabElements.push(v);
        })
        new TabData(element.text, tabElements);
    });
    selectTab(0);
}
//сохранение
function save() {
    window.localStorage.setItem("toDo", JSON.stringify(tabs));
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
    var newHeight = Math.min(textarea.scrollHeight-14, limit) + 57;
    inputPanel.style.height = newHeight + "px";

}