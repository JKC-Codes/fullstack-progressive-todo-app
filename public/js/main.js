const todos = document.querySelectorAll('.todo');
const formSubmit = document.querySelector('.form-submit');


todos.forEach(todo => {
	addTodoListeners(todo);
});


function addTodoListeners(todo) {
	const checkboxDone = todo.querySelector('.checkbox-done');
	const buttonEdit = todo.querySelector('.button-edit');
	const buttonDelete = todo.querySelector('.button-delete');

	checkboxDone.addEventListener('click', completeTodo);
	buttonEdit.addEventListener('click', editTodo);
	buttonDelete.addEventListener('click', deleteTodo);
}

function addTodo(event) {
	// TODO
};

function deleteTodo(event) {
	const todo = event.currentTarget.parentElement;
	const uid = todo.dataset.uid;

	fetch('/api/todos', {
		method: 'DELETE',
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify({uid: uid})
	})
	.catch(err => {
		console.error(err);
	})
};

function completeTodo(event) {
	// TODO
};

function editTodo(event) {
	// TODO
};