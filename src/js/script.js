
let todoList = $('.todo--list');
let task = $('.task');
let taskSender = $('#taskSender');
let taskCreator = $('#taskCreator');

$(document).on('click', '.task', function (event) {
    if (event.target.closest('.task--checkbox')) {
        $('.task--checkbox', this).toggleClass('_active');
        $('.task--title', this).toggleClass('_delete');
        $(this).toggleClass('_order')
    }

    if (event.target.closest('.task--close')) {
        $(this).remove();
    }
})
taskSender.on('click', function (event) {
    if (taskCreator.val()) {
        todoList.append(`<li class="todo--item task"><div class="task--content"><div class="task--body"><button class="task--checkbox"></button><h2 class="task--title">${taskCreator.val()}</h2></div><div class="task--manage"><button class="task--close"></button></div></div></li>`);
        taskCreator.val('')
    } else {
        taskCreator.addClass('_warn')
    }
})
$(document).on('keypress', function (event) {
    if (event.keyCode === 13) {
        if (taskCreator.val()) {
            todoList.append(`<li class="todo--item task"><div class="task--content"><div class="task--body"><button class="task--checkbox"></button><h2 class="task--title">${taskCreator.val()}</h2></div><div class="task--manage"><button class="task--close"></button></div></div></li>`);
            taskCreator.val('')
        } else {
            taskCreator.addClass('_warn')
        }
    }
})
taskCreator.on('click', function (event) {
    taskCreator.removeClass('_warn')
})
