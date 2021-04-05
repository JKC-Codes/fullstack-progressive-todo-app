import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongodb from 'mongodb';

dotenv.config();

const app = express();
const router = express.Router();
const port = process.env.PORT;
const connectionString = process.env.MONGODB_URI;
const MongoClient = new mongodb.MongoClient(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

app.set('view engine', 'ejs');

app.listen(port, function() {
	console.log(`Server listening on port ${port}`);
});

try {
	await MongoClient.connect();
	const todoCollection = await MongoClient.db().collection('todos');
	console.log('Connected to todos collection');

	app.get('/', (req, res) => {
		res.render('index.ejs', {todos: [{uid: 123, text: 'test', completed: true}]});
	});

	router.route('/api/todos')
	.post((req, res) => {

	})
	.patch((req, res) => {})
	.delete((req, res) => {})
}
catch(err) {
	throw new Error(err);
}
finally {
	await MongoClient.close();
}