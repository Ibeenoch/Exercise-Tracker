import express from 'express'
import cors from 'cors';
import path from 'path';
import { connectDb } from './config/db.js';
import dotenv from 'dotenv';
import Owner from './model/userModel.js';
import ExerciseTrack from './model/exerciseTracker.js';
dotenv.config();

const __dirname = path.resolve()

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
connectDb();

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});



app.post('/api/users', async(req, res) => {
    try {
        const { username } = req.body;

        const user = await Owner.create({
            username
        });

        res.status(201).json({
            username: user.username,
            _id: user._id,
        });
        
    } catch (error) {
        console.log(error)
    }
})

app.get('/api/users', async(req, res) => {
    try {

        const user = await Owner.findAll()

        res.status(201).json(user);
        
    } catch (error) {
        console.log(error)
    }
})

app.post('/api/users/:_id/exercises', async(req, res) => {
    try {
        const { description, duration } = req.body;
        const user = await Owner.findById({_id: req.params._id});
        // convert date 
        const date = req.body.date || Date.now();
        const inputDate = new Date(date);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const daysofWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        const day = inputDate.getDay();
        const month = inputDate.getMonth();
        const year = inputDate.getFullYear();
        const dayOfMonth = inputDate.getDate();

        const formattedDate = `${daysofWeek[day]} ${months[month]} ${dayOfMonth.toString().padStart(2, "0")} ${year}`

        const exercises = await ExerciseTrack.create({
            description, 
            duration: parseInt(duration),
            date: formattedDate,
            userId: user._id,
        })
console.log('execise', exercises)
        res.status(200).json({
            username: user.username,
            description: exercises.description,
            duration: exercises.duration,
            date: exercises.date,
            _id: user._id,
        })
        
    } catch (error) {
        console.log(error)
    }
})

app.get('/api/users/:_id/logs', async(req, res) => {
    try {
        const { from, to, limit } = req.query;
        
        const user = await Owner.findById(req.params._id)
        console.log( req.params)
        const exercises = await ExerciseTrack.find({
            userId: req.params._id,
            // date: { $gte: from, $lte: to }
        })
        .select('description duration date')
        .limit(parseInt(limit))
        .exec();

        console.log('exper ', exercises)

        const mappedExercise = exercises.map((exercise) => {
           return {
            description: exercise.description,
            duration: exercise.duration,
            date: exercise.date,
           }
        })
        console.log('mapped ', mappedExercise)
       
        res.status(200).json({
            username: user.username,
            count: mappedExercise.length,
            _id: user._id,
            log: mappedExercise
          })
        
    } catch (error) {
        console.log(error)
    }
})



const port = process.env.PORT || 3300;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
