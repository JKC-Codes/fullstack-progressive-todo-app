// TODO: Display changes message
// TODO: Manage focus

const formAddTodo = document.querySelector('[data-js="form-add-todo"]');

formAddTodo.addEventListener('submit', addTodo);

document.querySelectorAll('[data-js="list-item-todo"').forEach(todo => {
	removeTodoFallback(todo);
	addTodoListeners(todo);
});

function getTodoNodes(todo) {
	return {
		inputUID: todo.querySelector('[data-js="list-item-todo--input-hidden-uid"]'),
		labelCheckboxDone: todo.querySelector('[data-js="list-item-todo--label-checkbox-done"'),
		inputCheckboxDone: todo.querySelector('[data-js="list-item-todo--input-checkbox-done"]'),
		labelTextFallback: todo.querySelector('[data-js="list-item-todo--label-text-fallback"]'),
		inputTextFallback: todo.querySelector('[data-js="list-item-todo--input-text-fallback"]'),
		paragraphTodo: todo.querySelector('[data-js="list-item-todo--text-todo"]'),
		labelTextTodo: todo.querySelector('[data-js="list-item-todo--label-input-text-todo"]'),
		inputTextTodo: todo.querySelector('[data-js="list-item-todo--input-text-todo"]'),
		buttonSave: todo.querySelector('[data-js="list-item-todo--button-submit-save"]'),
		buttonEdit: todo.querySelector('[data-js="list-item-todo--button-edit"]'),
		buttonCancel: todo.querySelector('[data-js="list-item-todo--button-cancel"]'),
		buttonDelete: todo.querySelector('[data-js="list-item-todo--button-submit-delete"]')
	}
}

function removeTodoFallback(todo) {
	const nodes = getTodoNodes(todo);
	const text = nodes.inputTextFallback.getAttribute('value');
	const replacement = document.createElement('p');

	replacement.dataset.js = 'list-item-todo--text-todo';

	if(nodes.inputCheckboxDone.checked) {
		const strikethrough = document.createElement('s');
		strikethrough.textContent = text;
		replacement.append(strikethrough);
	}
	else {
		replacement.textContent = text;
	}

	nodes.labelTextFallback.replaceWith(replacement);

	nodes.buttonSave.setAttribute('hidden', '');
	nodes.buttonEdit.removeAttribute('hidden');
	nodes.buttonCancel.setAttribute('hidden', '');
	nodes.buttonDelete.removeAttribute('hidden');
}

function addTodoListeners(todo) {
	const nodes = getTodoNodes(todo);

	nodes.inputCheckboxDone.addEventListener('click', updateTodoDone);
	nodes.buttonSave.addEventListener('click', updateTodoText);
	nodes.buttonEdit.addEventListener('click', showTextInput);
	nodes.buttonCancel.addEventListener('click', hideTextInput);
	nodes.buttonDelete.addEventListener('click', deleteTodo);
}


function addTodo(event) {
	event.preventDefault();

	const form = document.querySelector('[data-js="form-add-todo"]');
	const text = form.querySelector('[data-js="form-add-todo--input-text-todo"]').value;

	if(text.length === 0) {
		return;
	}
	else {
		sendPost({text: text}, form);
	}
}

function updateTodoDone(event) {
	const todo = event.currentTarget.closest('[data-js="list-item-todo"]');
	const nodes = getTodoNodes(todo);

	sendPatch({
		uid: nodes.inputUID.value,
		done: nodes.inputCheckboxDone.checked
	});
}

function updateTodoText(event) {
	event.preventDefault();

	const todo = event.currentTarget.closest('[data-js="list-item-todo"]');
	const nodes = getTodoNodes(todo);

	sendPatch({
		uid: nodes.inputUID.value,
		text: nodes.inputTextTodo.value
	});
}

function deleteTodo(event) {
	event.preventDefault();

	const todo = event.currentTarget.closest('[data-js="list-item-todo"]');
	const nodes = getTodoNodes(todo);

	sendDelete({
		uid: nodes.inputUID.value
	});
}


function showTextInput(event) {
	const todo = event.currentTarget.closest('[data-js="list-item-todo"]');
	const nodes = getTodoNodes(todo);
	const label = document.createElement('label');
	const input = document.createElement('input');

	label.textContent = 'Todo';
	label.dataset.js = 'list-item-todo--label-input-text-todo';

	input.setAttribute('type', 'text');
	input.setAttribute('value', nodes.paragraphTodo.textContent);
	input.dataset.js = 'list-item-todo--input-text-todo';

	nodes.labelCheckboxDone.setAttribute('hidden', '');

	nodes.buttonSave.removeAttribute('hidden');
	nodes.buttonEdit.setAttribute('hidden', '');
	nodes.buttonCancel.removeAttribute('hidden');
	nodes.buttonDelete.setAttribute('hidden', '');

	label.append(input);

	nodes.paragraphTodo.replaceWith(label);
}

function hideTextInput(event) {
	const todo = event.currentTarget.closest('[data-js="list-item-todo"]');
	const nodes = getTodoNodes(todo);
	const textTodo = nodes.inputTextTodo.getAttribute('value');
	const paragraph = document.createElement('p');

	paragraph.dataset.js = 'list-item-todo--text-todo';
	if(nodes.inputCheckboxDone.checked) {
		const strikethrough = document.createElement('s');
		strikethrough.textContent = textTodo;
		paragraph.append(strikethrough);
	}
	else {
		paragraph.textContent = textTodo;
	}

	nodes.labelCheckboxDone.removeAttribute('hidden');

	nodes.buttonSave.setAttribute('hidden', '');
	nodes.buttonEdit.removeAttribute('hidden');
	nodes.buttonCancel.setAttribute('hidden', '');
	nodes.buttonDelete.removeAttribute('hidden');

	nodes.labelTextTodo.replaceWith(paragraph);
}


async function sendPost(bodyData, form) {
	const fetchOptions = {
		method: 'POST',
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify(bodyData)
	};

	try {
		const response = await fetch('/api/todos', fetchOptions);
		const responseData = await response.json();

		updateTodos(responseData.todos);
		form.reset();
	}
	catch(err) {
		console.error(err);
	}
};

async function sendPatch(bodyData) {
	const fetchOptions = {
		method: 'PATCH',
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify(bodyData)
	};

	try {
		const response = await fetch('/api/todos', fetchOptions);
		const responseData = await response.json();

		updateTodos(responseData.todos);
	}
	catch(err) {
		console.error(err);
	}
};

async function sendDelete(bodyData) {
	const fetchOptions = {
		method: 'DELETE',
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify(bodyData)
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


function updateTodos(todos) {
	const currentOutput = document.querySelector('[data-js="todos-output"]');

	if(todos.length === 0) {
		const paragraph = document.createElement('p');
		paragraph.textContent = 'No todos found';
		paragraph.dataset.js = 'todos-output';

		currentOutput.replaceWith(paragraph);
		return;
	}

	const todosList = document.createElement('ul');
	todosList.dataset.js = 'todos-output';

	todos.forEach(todo => {
		const liTodo = document.createElement('li');

		liTodo.dataset.js = 'list-item-todo';

		liTodo.innerHTML =`<form method="post" action="/api/todos" autocomplete="off">` +
			`<input type="hidden" name="uid" value="${todo._id}" data-js="list-item-todo--input-hidden-uid">` +
			`<label data-js="list-item-todo--label-checkbox-done">` +
				`Done` +
				`<input type="checkbox" name="done" data-js="list-item-todo--input-checkbox-done" ${todo.done ? 'checked' : ''}>` +
			`</label>` +
			`<p data-js="list-item-todo--text-todo">` +
				`${todo.done ? '<s>' : ''}` +
				`${todo.text}` +
				`${todo.done ? '</s>' : ''}` +
			`</p>` +
			`<button type="submit" name="button" value="save" data-js="list-item-todo--button-submit-save" hidden>` +
				`Save` +
			`</button>` +
			`<button type="button" data-js="list-item-todo--button-edit">` +
				`Edit` +
			`</button>` +
			`<button type="button" data-js="list-item-todo--button-cancel" hidden>` +
				`Cancel` +
			`</button>` +
			`<button type="submit" name="button" value="delete" data-js="list-item-todo--button-submit-delete">` +
				`Delete` +
			`</button>` +
			`</form>`;

		addTodoListeners(liTodo);
		todosList.append(liTodo);
	})

	currentOutput.replaceWith(todosList);
}