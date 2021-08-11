const formAddTodo = document.querySelector('[data-js="form--add-todo--page"]');
const todos = document.querySelectorAll('[data-js="li--todos-list--todo"]');

formAddTodo.addEventListener('submit', handleChange);

todos.forEach(todo => {
	addTodoListeners(todo);
	toggleTextInput(todo);
});


function getTodoNodes(todo) {
	return {
		inputUID: todo.querySelector('[data-js="input--todo--hidden-uid"]'),
		labelCheckboxDone: todo.querySelector('[data-js="label--todo--checkbox-done"]'),
		inputCheckboxDone: todo.querySelector('[data-js="input--todo--checkbox-done"]'),
		paragraphTodo: todo.querySelector('[data-js="p--todo--text"]'),
		labelTextTodo: todo.querySelector('[data-js="label--todo--text"]'),
		inputTextTodo: todo.querySelector('[data-js="input--todo--text"]'),
		buttonSave: todo.querySelector('[data-js="button--todo--save"]'),
		buttonEdit: todo.querySelector('[data-js="button--todo--edit"]'),
		buttonCancel: todo.querySelector('[data-js="button--todo--cancel"]'),
		buttonDelete: todo.querySelector('[data-js="button--todo--delete"]'),
	}
}

function addTodoListeners(todo) {
	const nodes = getTodoNodes(todo);

	nodes.inputCheckboxDone.addEventListener('click', handleChange);
	nodes.buttonSave.addEventListener('click', handleChange);
	nodes.buttonEdit.addEventListener('click', handleChange);
	nodes.buttonCancel.addEventListener('click', handleChange);
	nodes.buttonDelete.addEventListener('click', handleChange);
}

async function handleChange(event) {
	event.preventDefault();

	const formAdd = event.currentTarget.closest('[data-js|="form--add-todo"');
	const todoText = formAdd && formAdd.querySelector('[data-js="form-add-todo--todo-text"]').value;
	const liTodo = event.currentTarget.closest('[data-js="li--todos-list--todo"]');
	const nodes = liTodo && getTodoNodes(liTodo);

	let body;
	let method;
	let action;

	body = {uid: nodes && nodes.inputUID.value};

	switch(event.currentTarget.dataset.js) {
		case 'form--add-todo--page':
			delete body.uid;
			body.text = todoText;
			method = 'POST';
			action = 'added'
			formAdd.reset();
			break;

		case 'input--todo--checkbox-done':
			body.done = nodes.inputCheckboxDone.checked;
			method = 'PATCH';
			action = 'updated';
			break;

		case 'button--todo--save':
			body.text = nodes.inputTextTodo.value;
			method = 'PATCH';
			action = 'updated';
			break;

		case 'button--todo--edit':
			toggleTextInput(liTodo);
			return;

		case 'button--todo--cancel':
			toggleTextInput(liTodo);
			nodes.inputTextTodo.value = nodes.paragraphTodo.textContent;
			return;

		case 'button--todo--delete':
			method = 'DELETE';
			action = 'deleted';
			break;
	}

	try {
		notify('Updating…');
		const response = await updateDatabase(body, method);
		notify(`Todo ${action}`);
		updateTodos(response.todos);
	}
	catch(err) {
		console.error(err);
		notify('Something went wrong. Please refresh the page and try again');
	}
}

function notify(text) {
	const notification = document.querySelector('[data-js="output--notification--page"]');
	const timeoutValue = setTimeout(() => {
		if(timeoutValue.toString() === notification.dataset.timeout) {
			notification.classList.remove('js-show');
		}
	}, 2000, notification);

	notification.textContent = text;
	notification.dataset.timeout = timeoutValue;
	notification.classList.add('js-show');
}

async function updateDatabase(bodyData, method) {
	const fetchOptions = {
		method: method,
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify(bodyData)
	};

	const response = await fetch('/api/todos', fetchOptions);
	return response.json();
}

function toggleTextInput(todo) {
	const nodes = getTodoNodes(todo);

	if(nodes.labelTextTodo.hasAttribute('hidden')) {
		nodes.labelCheckboxDone.setAttribute('hidden', '');
		nodes.labelTextTodo.removeAttribute('hidden');
		nodes.paragraphTodo.setAttribute('hidden', '');
		nodes.buttonSave.removeAttribute('hidden');
		nodes.buttonEdit.setAttribute('hidden', '');
		nodes.buttonCancel.removeAttribute('hidden');
		nodes.buttonDelete.setAttribute('hidden', '');
	}
	else {
		nodes.labelCheckboxDone.removeAttribute('hidden');
		nodes.labelTextTodo.setAttribute('hidden', '');
		nodes.paragraphTodo.removeAttribute('hidden');
		nodes.buttonSave.setAttribute('hidden', '');
		nodes.buttonEdit.removeAttribute('hidden');
		nodes.buttonCancel.setAttribute('hidden', '');
		nodes.buttonDelete.removeAttribute('hidden');
	}
}

function updateTodos(todos) {
	const sectionTodos = document.querySelector('[data-js="section--todos--page"]');
	const outputTodos = sectionTodos.querySelector('[data-js="output--todos--count"]');
	const listTodosCurrent = sectionTodos.querySelector('[data-js="ul--todos--todos-list"]');

	if(todos.length === 0) {
		outputTodos.textContent = 'No todos found';
		listTodosCurrent.remove();
		return;
	}

	const listTodosNew = document.createElement('ul');
	listTodosNew.classList.add('ul--todos--todos-list');
	listTodosNew.dataset.js = 'ul--todos--todos-list';

	todos.forEach(todo => {
		const liTodo = document.createElement('li');

		liTodo.classList.add('li--todos-list--todo');
		liTodo.dataset.js = 'li--todos-list--todo';

		liTodo.innerHTML =`<form method="post" action="/api/todos" autocomplete="off" aria-labelledby="todo-text-${todo._id}" class="form--todo--form">` +
			`<input type="hidden" name="uid" value="${todo._id}" data-js="input--todo--hidden-uid">` +
			`<label class="label--todo--checkbox-done" data-js="label--todo--checkbox-done">` +
				`<span class="label--todo--span-text">Done</span>` +
				`<input type="checkbox" name="done" data-js="input--todo--checkbox-done" ${todo.done ? 'checked' : ''}>` +
			`</label>` +
			`<label class="label--todo--text" data-js="label--todo--text" hidden>` +
				`Todo` +
				`<input type="text" name="text" value="${todo.text}" data-js="input--todo--text">` +
			`</label>` +
			`<p class="p--todo--text" id="todo-text-${todo._id}" data-js="p--todo--text">` +
				`${todo.done ? '<s>' : ''}` +
				`${todo.text}` +
				`${todo.done ? '</s>' : ''}` +
			`</p>` +
			`<button type="submit" name="button" value="save" class="button--todo--left" data-js="button--todo--save" hidden>` +
				`Save` +
			`</button>` +
			`<button type="button" class="button--todo--left" data-js="button--todo--edit">` +
				`Edit` +
			`</button>` +
			`<button type="button" class="button--todo--right" data-js="button--todo--cancel" hidden>` +
				`Cancel` +
			`</button>` +
			`<button type="submit" name="button" value="delete" class="button--todo--right" data-js="button--todo--delete">` +
				`Delete` +
			`</button>` +
			`</form>`
		;

		addTodoListeners(liTodo);
		listTodosNew.append(liTodo);
	})

	if(listTodosCurrent) {
		listTodosCurrent.replaceWith(listTodosNew);
	}
	else {
		sectionTodos.append(listTodosNew);
	}

	const newTodosCount = `${todos.filter(todo => todo.done).length} of ${todos.length} todos complete`;
	if(newTodosCount !== outputTodos.textContent) {
		outputTodos.textContent = newTodosCount;
	}
}