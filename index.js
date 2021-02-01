const {ApolloServer, PubSub} = require('apollo-server');
const mongoose = require('mongoose')

const { MONGODB }= require('./config.js');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers/index');

const pubsub = new PubSub();

const PORT = process.env.port || 5000

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req, pubsub})
    })

mongoose
    .connect(MONGODB, {useNewUrlParser:true, useUnifiedTopology: true})
    .then(() => {
        console.log('Connected to db')
        return server.listen({port: PORT})

    })
    .then((res) => {
        console.log(`Server started @ ${res.url} `)
    })
    .catch( err => {
        console.log(err);
    })