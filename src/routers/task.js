const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')

// Get all the tasks. Serveral ways to get tasks
// GET /tasks
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if (req.query.completed)
        match.completed = (req.query.completed === 'true')

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = (parts[1] === 'desc') ? -1 : 1
    }

    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit,
                skip,
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

//Get a single task
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send({})
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

//Create a new task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

//Update a single task
router.patch('/tasks/:id', auth, async (req, res) => {
    const incomingFields = Object.keys(req.body)
    const validFields = ['description', 'completed']
    const isValidUpdate = incomingFields.every((update) => validFields.includes(update))
    if (!isValidUpdate) {
        return res.status(400).send({ 'Error': 'Invalid field being updated' })
    }

    try {
        //const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        incomingFields.forEach((field) => task[field] = req.body[field])
        task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Delete a single task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        //const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        task.delete()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router