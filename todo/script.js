//debug забейте
function test() {
    new TabData("Тест" + tabs.length, [
        new TaskData(date(2021, 6, 8), "Старая заметка из js", 3, 'black', false, false, false, false),
        new TaskData(new Date(), "Новая заметка из js", 3, 'black', true, false, false, false),
        new TaskData(new Date(), "Заметка из класса", 2, 'red', false, false, false, false)
    ]).create();
    save();
}

// вкладка
class TabData {

    constructor(text, elements) {
        //забейте
        this.uuid = tabs.length;
        //номер вкладки
        this.text = text;
        //заметки
        this.elements = elements;
        //автодобавление в массив
        tabs.push(this);
        //добавление html кнопку со вкладкой
        this.fill(false);
    }

    //заполнение страницы заметками
    create() {
        $("#elements").html("");
        let i = 0;
        this.sort();
        this.elements.forEach(value => {
            value.uuid = i;
            value.create(this.uuid);
            i++;
        });
    }

    // удаление заметки
    removeTask(uuid) {
        array = [];
        change = false;

        this.elements.forEach((element) => {
            if (change || element.uuid != uuid) {
                if (change) {
                    element.uuid -= 1;
                }
                array.push(element);
            } else {
                change = true;
            }
        });

        if (change) {
            while (this.elements.length > 0) {
                this.elements.pop();
            }

            array.forEach((element) => {
                this.elements.push(element);
            });

            this.create();
            save();
        }
    }

    // изменение звезд на заметке
    clickOnStar(uuid, id) {
        let bl = false;
        this.elements.forEach((element) => {
            if (element.uuid == uuid) {
                let stars = element.stars;
                element.clickOnStar(id);
                let n = element.stars;
                if (n != stars) {
                    bl = true;
                }
            }
        });
        if (bl) {
            this.create();
            save();
        }
    }

    // кнопка со вкладкой
    fill(selected) {
        var context = '<button id="tab_' + this.uuid + '" uuid=' + this.uuid + ' class="tabs_item';
        if (selected) {
            context += ' tabs_selected';
        }
        context += '"><p class="tab_text'
        if (selected) {
            context += ' tab_selected_text';
        }
        context += '">Вкладка ';
        context += this.text + '</p></button>';
        $("#tabs").append(context);
        $('#tab_' + this.uuid).mousedown(function(event) {
            let uuid = this.getAttribute('uuid');
            switch (event.which) {
                case 1:
                    selectTab(uuid);
                    break;
                case 3:
                    let confir = confirm('Удалить вкладку ' + this.firstChild.innerHTML);
                    if (confir) {
                        deleteTab(uuid);
                    }
                    break;
            }
        });


        // jQuery(document).ready(function($) {


        // })

        // $('#tab_' + this.uuid).dbclick(function(event) {
        //     alert("afeqf");
        // let uuid = this.getAttribute('uuid');
        // var input = document.createElement("input");
        // selectTab(uuid);
        // input.className = "tab_name";
        // tab_text.append(input);

        // context

        // });
        // // ! редактирование названия вкладки
        // console.log("пиппц"); 
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
    create(tab) {
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
            '<span style="min-width: 9vh;" class="listElDate">' +
            day +
            "." +
            month +
            "." +
            (this.year - 2000) +
            "</span>";

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

    // метод обсчитывающий звезды при нажатии на звезду под номером id
    clickOnStar(id) {
        let stars = this.stars;
        if (stars == id) {
            stars -= 1;
            if (stars == 0) {
                stars = 1;
            }
        } else {
            stars = id;
        }
        let old = this.stars;
        if (old != stars) {
            this.stars = stars;
        }
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
const input = new TaskData(new Date(), "", 1, 'black', false, false, false, false);
// текущая вкладка
var selected = -1;
// все вкладки
const tabs = [];

// ! Создание первой вкладки
var checkLocalStorage = localStorage.length;
console.log(checkLocalStorage);
//сетап
$(document).ready(function() {
    load();
    // ! Создание первой вкладки
    if (checkLocalStorage == 0) {
        createTab();
    }
    clickOnStar(3);
    $(".round").map(function() {
        this.style.background = this.getAttribute('color');
        return this;
    });
    updateTextArea();

    // каждой появляющейся кнопке при наведении на значок настроек задаём функцию показать 
    // выпадающее меню. 0ой кнопке - 0ое меню, 1ой кнопке - 1ое меню в html коде
    // снизу: получить все .ico-bloc находящиеся в .popup то есть выпадающие .ico-block
    //  при наведении на значок настроек
    var btns = document.querySelectorAll(".popup .ico-block");
    console.log(btns);
    for (let index = 0; index < btns.length; index++) {
        var btn = btns[index];
        // не понимаю зачем строка снизу но без неё не работает
        var secondaryPopup = document.querySelectorAll(".secondary-popup")[index];
        secondaryPopup.style.display = 'none';
        btn.onmouseover = () => {
            var secondaryPopup = document.querySelectorAll(".secondary-popup")[index];
            secondaryPopup.style.display = 'block';
        }
        btn.onmouseout = () => {
            var secondaryPopup = document.querySelectorAll(".secondary-popup")[index];
            secondaryPopup.style.display = 'none';
        }
        console.log(btn.onmouseover);
    }
});

var settingsArea = document.getElementsByClassName("settings-buttons-container")[0];
var popupMenu = document.getElementsByClassName("popup")[0];
var inputPanel = document.getElementsByClassName("input-panel")[0];


settingsArea.onmouseover = () => {
    // включаем отображение
    popupMenu.style.display = 'block';
    inputPanel.setAttribute("style", "height:111px");
}

settingsArea.onmouseout = () => {
    popupMenu.style.display = 'none';
    inputPanel.setAttribute("style", "height:111px");
}


//показать по клику
// function PopUp(id) {
// 	if ($('#' + id).is(":visible")) {
// 		PopUpHide(id);
// 	} else {
// 		PopUpShow(id);
// 	}
// }

// //Функция отображения PopUp
// function PopUpShow(id){
// 	$('#' + id).show();
// }
// //Функция скрытия PopUp
// function PopUpHide(id) {
// 	$("#" + id).hide();
// }
//удалить заметку
function removeTask(tabId, uuid) {
    array = [];
    change = false;

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
            tab.fill(true);
            tab.create();
            selected = tabId;
        } else {
            tab.fill(false);
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

//создать новую
function createTab() {
    $("#tabs").html("");
    $("#elements").html("");
    let i = 0;
    tabs.forEach(el => {
        if (el.text > i) {
            i = el.text;
        }
    });
    new TabData((i + 1), []).create();
    selectTab(tabs.length - 1);
    save();
}
//удалить
function deleteTab(uuid) {
    array = [];
    change = false;

    tabs.forEach((element) => {
        if (change || element.uuid != uuid) {
            if (change) {
                element.uuid -= 1;
            }
            array.push(element);
        } else {
            change = true;
        }
    });

    if (change) {
        while (tabs.length > 0) {
            tabs.pop();
        }

        array.forEach((element) => {
            tabs.push(element);
        });
        save();
        if (selected == uuid) {
            selectTab(0);
        } else {
            selectTab(selected);
        }
    }
}

/** создание заметки */
//звезда новой заметки
function clickOnStar(id) {
    input.clickOnStar(id);
    let inp = $('#star_input_div');
    inp.html('');
    let text = '';
    for (let index = 1; index <= 5; index++) {
        text += '<img class="input_star_img" is="star_' + index + '" alt="" onclick="clickOnStar(' + index + ')" src="assets/';
        if (index <= input.stars) {
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
        tabs[selected].elements.push(new TaskData(new Date(), text, input.stars, input.color, input.bold, input.strike, input.underline, input.italic));
        tabs[selected].create();
        save();
    }
    inp.val('');
}
//изменить цвет
function changeColor(btn) {
    input.color = btn.getAttribute('color');
    updateTextArea();
}
//изменить форматирование
function changeFont(i) {
    switch (i) {
        case 0:
            {
                input.bold = !input.bold;
                break;
            }
        case 1:
            {
                input.strike = !input.strike;
                break;
            }
        case 2:
            {
                input.underline = !input.underline;
                break;
            }
        case 3:
            {
                input.italic = !input.italic;
                break;
            }
    }
    updateTextArea();
}
//форматирование поле ввода
function updateTextArea() {
    let inp = $('#input_to_do');
    inp.css('color', input.color);
    if (input.bold) {
        inp.css('font-weight', 'bold');
    } else {
        inp.css('font-weight', '');
    }

    let decoration = '';
    if (input.strike && input.underline) {
        decoration = 'line-through underline';
    }
    if (!input.strike && input.underline) {
        decoration = 'underline';
    }
    if (input.strike && !input.underline) {
        decoration = 'line-through';
    }
    inp.css('text-decoration', decoration);

    if (input.italic) {
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
// в user_input и inputPanel ещё нужно поставить : align-items: end
var textarea = document.getElementById("input_to_do");
var limit = 200;

textarea.oninput = function() {
    textarea.style.height = "62px";
    textarea.style.height = Math.min(textarea.scrollHeight, limit) + "px";

    var inputPanel = document.getElementsByClassName("input-panel")[0];
    inputPanel.style.height = (Math.min(textarea.scrollHeight, limit) + 57) + "px";
};