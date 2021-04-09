const formSubmit = document.querySelector('#form-submit');

document.querySelectorAll('.todo').forEach(todo => {
	addTodoListeners(todo);
	hideInput(todo);
});

formSubmit.querySelector('button[type=submit]').addEventListener('click', addTodo);


function addTodoListeners(todo) {
	const checkboxDone = todo.querySelector('.checkbox-done');
	const buttonSave = todo.querySelector('.button-save');
	const buttonEdit = todo.querySelector('.button-edit');
	const buttonDelete = todo.querySelector('.button-delete');

	checkboxDone.addEventListener('click', toggleTodoDone);
	buttonSave.addEventListener('click', saveTodoEdit);
	buttonEdit.addEventListener('click', editTodo);
	buttonDelete.addEventListener('click', deleteTodo);
}

async function addTodo(event) {
	event.preventDefault();

	try {
		const todoValue = formSubmit.querySelector('input[name="text"]').value;

		if(todoValue.length === 0) {
			return;
		}

		const fetchOptions = {
			method: 'POST',
			headers: {
				'Content-type': 'application/json'
			},
			body: JSON.stringify({text: todoValue})
		};
		const response = await fetch('/api/todos', fetchOptions);
		const data = await response.json();

		updateTodos(data.todos);
		formSubmit.reset();
	}
	catch(err) {
		console.error(err);
	}
};

async function deleteTodo(event) {
	event.preventDefault();

	const todo = event.currentTarget.closest('.todo');
	const uid = todo.querySelector('.uid').value;
	const fetchOptions = {
		method: 'DELETE',
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify({uid: uid})
	};

	try {
		const response = await fetch('/api/todos', fetchOptions);
		const data = await response.json();

		updateTodos(data.todos);
	}
	catch(err) {
		console.error(err);
	}
};

async function toggleTodoDone(event) {
	const todo = event.currentTarget.closest('.todo');
	const uid = todo.querySelector('.uid').value;
	const checkbox = todo.querySelector('.checkbox-done');
	const fetchOptions = {
		method: 'PATCH',
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify({uid: uid, done: checkbox.checked.toString()})
	};

	try {
		const response = await fetch('/api/todos', fetchOptions);
		const data = await response.json();

		updateTodos(data.todos);
	}
	catch(err) {
		console.error(err);
	}
};

function editTodo(event) {
	event.preventDefault();
	const todo = event.currentTarget.closest('.todo');
	showInput(todo);
};

async function saveTodoEdit(event) {
	event.preventDefault();

	const todo = event.currentTarget.closest('.todo');
	const uid = todo.querySelector('.uid').value;
	const text = todo.querySelector('.input-text').value;
	const fetchOptions = {
		method: 'PATCH',
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify({uid: uid, text: text})
	};

	hideInput(todo);

	try {
		const response = await fetch('/api/todos', fetchOptions);
		const data = await response.json();

		updateTodos(data.todos);
	}
	catch(err) {
		console.error(err);
	}
};

function hideInput(todo) {
	const inputText = todo.querySelector('.input-text');
	const labelCheckboxDone = todo.querySelector('.label-checkbox-done');
	const buttonSave = todo.querySelector('.button-save');
	const buttonEdit = todo.querySelector('.button-edit');
	const buttonDelete = todo.querySelector('.button-delete');
	const text = inputText.value;
	const span = document.createElement('span');

	labelCheckboxDone.removeAttribute('hidden');
	buttonSave.setAttribute('hidden', '');
	buttonEdit.removeAttribute('hidden');
	buttonDelete.removeAttribute('hidden');

	span.className = 'span-text';
	span.textContent = text;
	inputText.replaceWith(span);
}

function showInput(todo) {
	const spanText = todo.querySelector('.span-text');
	const labelCheckboxDone = todo.querySelector('.label-checkbox-done');
	const buttonSave = todo.querySelector('.button-save');
	const buttonEdit = todo.querySelector('.button-edit');
	const buttonDelete = todo.querySelector('.button-delete');
	const text = spanText.textContent;
	const input = document.createElement('input');

	labelCheckboxDone.setAttribute('hidden', '');
	buttonSave.removeAttribute('hidden');
	buttonEdit.setAttribute('hidden', '');
	buttonDelete.setAttribute('hidden', '');

	input.className = 'input-text';
	input.value = text;
	input.setAttribute('type', 'text');
	input.setAttribute('name', 'text');
	spanText.replaceWith(input);
}

function updateTodos(updatedTodos) {
	const noTodosPlaceholder = document.querySelector('.no-todos-placeholder');
	const listTodos = document.querySelector('.list-todos');
	const currentTodoList = noTodosPlaceholder || listTodos;

	if(updatedTodos.length === 0) {
		const text = document.createElement('p');
		text.className = 'no-todos-placeholder';
		text.textContent = 'No todos found';

		currentTodoList.replaceWith(text);
		return;
	}

	let newTodoList = document.createElement('ul');
	newTodoList.className = 'list-todos';

	updatedTodos.forEach(todo => {
		const li = document.createElement('li');
		const form = document.createElement('form');
		const inputUID = document.createElement('input');
		const labelInputCheckbox = document.createElement('label');
		const inputCheckbox = document.createElement('input');
		const textTodo = document.createElement('span');
		const strikethrough = document.createElement('s');
		const text = document.createElement('span');
		const buttonSave = document.createElement('button');
		const buttonEdit = document.createElement('button');
		const buttonDelete = document.createElement('button');

		li.className = 'todo';

		form.setAttribute('method', 'post');
		form.setAttribute('action', '/api/todos');
		form.setAttribute('autocomplete', 'off');

		inputUID.className = 'uid';
		inputUID.setAttribute('type', 'hidden');
		inputUID.setAttribute('name', 'uid');
		inputUID.setAttribute('value', todo._id);

		labelInputCheckbox.className = 'label-checkbox-done';
		labelInputCheckbox.textContent = 'Done';

		inputCheckbox.className = 'checkbox-done';
		inputCheckbox.setAttribute('type', 'checkbox');
		inputCheckbox.setAttribute('name', 'done');
		inputCheckbox.setAttribute('value', 'true');
		if(todo.done === 'true') {
			inputCheckbox.setAttribute('checked', '');
		}

		textTodo.className = 'todo-text';

		text.className = 'span-text';
		text.textContent = todo.text;

		buttonSave.className = 'button-save';
		buttonSave.setAttribute('type', 'submit');
		buttonSave.setAttribute('name', 'button');
		buttonSave.setAttribute('value', 'save');
		buttonSave.setAttribute('hidden', '');
		buttonSave.textContent = 'Save';

		buttonEdit.className = 'button-edit';
		buttonEdit.setAttribute('type', 'button');
		buttonEdit.setAttribute('name', 'button');
		buttonEdit.setAttribute('value', 'edit');
		buttonEdit.textContent = 'Edit';

		buttonDelete.className = 'button-delete';
		buttonDelete.setAttribute('type', 'submit');
		buttonDelete.setAttribute('name', 'button');
		buttonDelete.setAttribute('value', 'delete');
		buttonDelete.textContent = 'Delete';

		li.append(form);
		form.append(inputUID);
		form.append(labelInputCheckbox);
		labelInputCheckbox.append(inputCheckbox);
		form.append(textTodo);
		if(todo.done === 'true') {
			strikethrough.append(text);
			textTodo.append(strikethrough);
		}
		else {
			textTodo.append(text);
		}
		form.append(buttonSave);
		form.append(buttonEdit);
		form.append(buttonDelete);

		addTodoListeners(li);
		newTodoList.append(li);
	});

	currentTodoList.replaceWith(newTodoList);
}