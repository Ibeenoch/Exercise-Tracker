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
        console.log(error);
        res.send('an error occured');
    }
})

app.get('/api/users', async( req, res) => {
    try {

        const user = await Owner.find({}).select("_id username")

        res.status(201).json(user);
        
    } catch (error) {
        console.log(error);
        res.send('an error occured');
    }
})

app.post('/api/users/:_id/exercises', async(req, res) => {
    try {
        const { description, duration, date } = req.body;
        const user = await Owner.findById(req.params._id);
     
        const exercises = await ExerciseTrack.create({
            userId: user._id,
            description,
            duration: parseInt(duration),
            date: date ? new Date(date)  : new Date(),
        })

        res.status(200).json({
            _id: user._id,
            username: user.username,
            description: exercises.description,
            duration: exercises.duration,
            date: new Date(exercises.date).toDateString(),
        })
        
    } catch (error) {
        console.log(error);
        res.send('an error occured');
    }
})

app.get('/api/users/:_id/logs', async(req, res) => {
   try {
    const _id = req.params._id;
        const {from, to, limit} = req.query

        const foundUser = await Owner.findOne({
            "_id": _id
        })

        if (!foundUser) return res.status(404).json({ "message": `User with id ${_id} not found` })
        const { username } = foundUser;
        let exercises = await ExerciseTrack.find({
            "userId": _id,
        });

        if (from) {
            const fromDate = new Date(from);
            exercises = exercises.filter(exercise => new Date(exercise.date) >= fromDate);
        }
        if (to) {
            const toDate = new Date(to);
            exercises = exercises.filter(exercise => new Date(exercise.date) <= toDate);
        }
        if (limit) {
            exercises = exercises.splice(0, Number(limit));
        }
        let count = exercises.length;

        const exercisesList = exercises.map(exercise => {
            return {
                "description": exercise.description,
                "duration": exercise.duration,
                "date": exercise.date instanceof Date ? exercise.date.toDateString(): (new Date(exercise.date)).toDateString()
            }
        });

        return res.json({
            "username": username,
            "count": count,
            "_id": _id,
            "log": exercisesList
        })

   } catch (error) {
    console.log(error);
    res.status(500).json({
        "nessage" : "server error"
    })
   }

    // try {
    //     const { from, to, limit } = req.query;
    //     console.log(from, to, limit);

    //     const auser = await Owner.findById(req.params._id);
       
    //     if(!auser){
    //     res.send("could not find user");
    //     return;
    //    }

    //    let dateObj = {};
    //    if(from){
    //     dateObj["$gte"] = new Date(from)
    //    }
    //    if(to){
    //      dateObj["$lte"] = new Date(to)
    //    }

    //    let filter = {
    //     userId: req.params._id
    //    }

    //    if(from && to){
    //     filter.date = dateObj;
    //    }

       
    //    const exercises = await ExerciseTrack.find(filter).limit(+limit ?? 500);

    //    const log = exercises.map( e => ({
    //     description: e.description,
    //     duration: e.duration,
    //     date: e.date instanceof Date ? e.date.toDateString() : (new Date(e.date)).toDateString()
    //    }));

    //    const user = {
    //     username: auser.username,
    //     count: exercises.length,
    //     _id: auser._id,
    //     log
    //    };
       
    //    res.status(200).json(user)
    // } catch (error) {
    //     console.log(error);
    //     res.send('an error occured')
    // }
})



const port = process.env.PORT || 3300;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
