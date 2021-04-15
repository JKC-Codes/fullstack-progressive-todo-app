import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongodb from 'mongodb';

dotenv.config();

const app = express();
const todoRoutes = express.Router();
const port = process.env.PORT;
const connectionString = process.env.MONGODB_URI;
const MongoClient = new mongodb.MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(todoRoutes);
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

todoRoutes.use(cors());
todoRoutes.use(express.json());
todoRoutes.use(express.static('public'));
todoRoutes.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');

app.listen(port, function() {
	console.log(`Server listening on port ${port}`);
});


async function start() {
	const fallbackRequests = ['submit', 'save', 'delete'];
	let todoCollection;

	try {
		await MongoClient.connect();
		todoCollection = await MongoClient.db().collection('todos');
		console.log('Connected to todos collection');
	}
	catch(err) {
		throw new Error(err);
	}

	async function getTodos() {
		return await todoCollection.find().sort({text: 1}).toArray();
	}

	app.get('/', async (req, res) => {
		res.render('index.ejs', {todos: await getTodos()});
	});

	todoRoutes.route('/api/todos')
	.get((req, res) => {
		res.redirect('/');
	})
	.post(async (req, res) => {
		if(fallbackRequests.includes(req.body.button)) {
			await handleFallbacks(req, res);
			return;
		}
		else if(req.body.text) {
			await addTodo(req.body.text);
		}
		res.send({todos: await getTodos()});
	})
	.patch(async (req, res) => {
		await editTodo(req.body);
		res.send({todos: await getTodos()});
	})
	.delete(async (req, res) => {
		if(req.body.uid) {
			await deleteTodo(req.body.uid);
		}
		res.send({todos: await getTodos()});
	})


	async function handleFallbacks(req, res) {
		switch(req.body.button) {
			case 'submit': await addTodo(req.body.text);
				break;
			case 'save':
				delete req.body.button;
				req.body.done = req.body.done ? true : false;
				await editTodo(req.body);
				break;
			case 'delete': await deleteTodo(req.body.uid);
				break;
		}
		res.redirect('/');
	}

	async function addTodo(text) {
		if(!/\S/.test(text)) {
			return;
		}

		await todoCollection.insertOne({
			text: text,
			done: false
		});
	}

	async function editTodo(reqBody) {
		const amendments = {}
		for(const [key, value] of Object.entries(reqBody)) {
			if(key === 'uid') {
				continue;
			}
			else if(key === 'text' && !/\S/.test(value)) {
				deleteTodo(reqBody.uid);
				return;
			}
			amendments[key] = value;
		}
		await todoCollection.findOneAndUpdate(
			{_id: mongodb.ObjectId(reqBody.uid)},
			{$set: amendments},
		);
	}

	async function deleteTodo(uid) {
		await todoCollection.deleteOne({_id: mongodb.ObjectId(uid)});
	}
}

start()
.catch(err => {
	console.error(err);
})
.finally(MongoClient.close());