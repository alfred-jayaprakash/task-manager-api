//CRUD operations

const { MongoClient, ObjectID } = require('mongodb')

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

const id = new ObjectID()

MongoClient.connect(connectionURL, { useNewUrlParser: true }, (error, client) => {
    if (error) {
        return console.log('Unable to connect to the database')
    }

    const db = client.db(databaseName)

    // db.collection('users').updateOne({
    //     _id: new ObjectID('5cfa3c4e32898e075f8c3ffb')
    // }, {
    //     $inc: {
    //         age: 1
    //     }
    // }).then((result) => {
    //     console.log('Data updated successfully!')
    // }).catch((error) => {
    //     console.log(error)
    // })

    // db.collection('tasks').updateMany(
    //     {
    //         completed: false
    //     }, {
    //         $set: {
    //             completed: true
    //         }
    //     }).then((result) => {
    //         console.log('Tasks updated successfully!')
    //     }).catch((error) => {
    //         console.log(error)
    //     })

    db.collection('tasks').findOne({
        description: 'Pay School Fees'
    }).then((result) => {
        console.log(result)
    }).catch((error) => {
        console.log(error)
    })    

    // db.collection('tasks').deleteOne({
    //     description: 'Submit CPE'
    // }).then((result) => {
    //     console.log(result.deletedCount,'rows deleted successfully!')
    // }).catch((error) => {
    //     console.log(error)
    // })
})
