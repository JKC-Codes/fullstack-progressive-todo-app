const todos = document.querySelectorAll('.todo');
const formSubmit = document.querySelectorAll('.form-submit');


todos.forEach(todo => {
	addTodoListeners(todo);
});

formSubmit.addEventListener('submit', addTodo);


function addTodoListeners(todo) {
	const checkboxDone = todo.querySelector('.checkbox-done');
	const buttonEdit = todo.querySelector('.button-edit');
	const buttonDelete = todo.querySelector('.button-delete');

	checkboxDone.addEventListener('click', updateTodos);
	buttonEdit.addEventListener('click', showEditField);
	buttonDelete.addEventListener('click', updateTodos);
}

function addTodo(event) {
	// TODO
};

function updateTodos(event) {
	// TODO
};

function showEditField(event) {
	// TODO
};