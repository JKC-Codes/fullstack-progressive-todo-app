const todosSection = document.querySelector('.section-todos');
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
	buttonSave.addEventListener('click', saveTodo);
	buttonEdit.addEventListener('click', editTodo);
	buttonDelete.addEventListener('click', deleteTodo);
}

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

async function saveTodo(event) {
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


function updateTodos(updatedTodos) {
	window.location.reload();
	return;
	if(updatedTodos.length === 0) {
		const text = document.createElement('p');
		text.textContent = 'No todos found';

		todosSection.replaceChildren(text);
		return;
	}

	let newTodoList = document.createElement('ul');
	newTodoList.className = 'list-todos';

	updatedTodos.forEach(todo => {
		const li = document.createElement('li');
		const label = document.createElement('label');
		const checkbox = document.createElement('input');
		const text = document.createElement('span');
		const editButton = document.createElement('button');
		const deleteButton = document.createElement('button');

		label.textContent = 'Mark as done';
		text.textContent = todo.text;
		if(todo.done) {
			const textNodes = text.childNodes;
			const strikethrough = document.createElement('s');
			strikethrough.append(...textNodes);
			text.replaceChildren(strikethrough);
		}
		editButton.textContent = 'Edit';
		deleteButton.textContent = 'Delete';

		li.className = 'todo';
		li.setAttribute('data-uid', todo._id);
		checkbox.className = 'checkbox-done';
		checkbox.setAttribute('type', 'checkbox');
		if(todo.done) {
			checkbox.setAttribute('checked', 'true');
		}
		text.className = 'todo-text';
		editButton.className = 'button-edit';
		editButton.setAttribute('type', 'button');
		deleteButton.className = 'button-delete';
		deleteButton.setAttribute('type', 'button');

		label.append(checkbox);
		li.append(label);
		li.append(text);
		li.append(editButton);
		li.append(deleteButton);

		addTodoListeners(li);
		newTodoList.append(li);
	});

	todosSection.replaceChildren(newTodoList);
}