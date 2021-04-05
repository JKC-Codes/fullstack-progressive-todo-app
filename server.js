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
	.post(async (req, res) => {
		if(req.body.text) {
			await todoCollection.insertOne({
				text: req.body.text,
				done: false
			});
		}
		res.send({todos: await getTodos()});
	})
	.patch((req, res) => {
		// TODO
	})
	.delete(async (req, res) => {
		if(req.body.uid) {
			await todoCollection.deleteOne({_id: mongodb.ObjectId(req.body.uid)});
		}

		res.send({todos: await getTodos()});
	})
}

start()
.catch(err => {
	console.error(err);
})
.finally(MongoClient.close());