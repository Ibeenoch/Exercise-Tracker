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
        if(!user){
            res.status(404).send('user not found');
            return;
        }

        const user = await Owner.findAll({}).select("_id username")

        res.status(201).json(user);
        
    } catch (error) {
        console.log(error)
    }
})

app.post('/api/users/:_id/exercises', async(req, res) => {
    try {
        const { description, duration, date } = req.body;
        const user = await Owner.findById(req.params._id);
        // convert date 
        // const inputDate = new Date(date);
        // const months = [Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec];
        // const daysofWeek = [Mon, Tue, Wed, Thu, Fri, Sat, Sun];

        // const day = inputDate.getDay();
        // const month = inputDate.getMonth();
        // const year = inputDate.getFullYear();
        // const dayOfMonth = inputDate.getDate();

        // const formattedDate = `${daysofWeek[day]} ${months[month]} ${dayOfMonth.toString().padStart(2, "0")} ${year}`

        const exercises = await ExerciseTrack.create({
            userId: Owner._id,
            description,
            duration: parseInt(duration),
            date: date ? new Date(date)  : new Date(),
        })

        res.status(200).json({
            _id: Owner._id,
            username: Owner.username,
            description: exercises.description,
            duration: exercises.duration,
            date: new Date(exercises.date).toDateString(),
        })
        
    } catch (error) {
        console.log(error)
    }
})

app.get('/api/users/:_id/logs', async(req, res) => {
    try {
        const { from, to, limit } = req.query;
        const user = await Owner.findById(req.params._id);
       if(!user){
        res.send("could not find user");
        return;
       }
       let dateObj = {};
       if(from){
        dateObj["$gte"] = new Date(from)
       }
       if(to){
        dateObj["$lte"] = new Date(to)
       }

       let filter = {
        user_id: req.params.id
       }

       if(from || to){
        filter.date = dateObj;
       }

       const exercises = await ExerciseTrack.find(filter).limit(+limit ?? 500);

       const log = exercises.map( e => ({
        description: e.description,
        duration: e.duration,
        date: new Date(e.date).toDateString()
       }));
       
       res.json({
        username: user.username,
        count: exercises.length,
        _id: user._id,
        log
       })
    } catch (error) {
        console.log(error)
    }
})



const port = process.env.PORT || 3300;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
