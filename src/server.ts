import fastify from "fastify"
import { sseClientManager } from "./clientsManager"

const port = 3600


const app = fastify({ logger: false })


app.get('/', async (request, res) => {
    return "inter-cluster-queue-manager-server up!"
});




app.post('/sendMessageToTopic', async (request, res) => {

    const body = request.body as {
        topic: string,
        message_body: any
    }

    sseClientManager.sendEvents(body.topic, {
        timestamp: new Date().toISOString(),
        event: body.message_body,
        topic:body.topic
    },
        [body.topic]
    )

    return {
        success: true,
        msg: `event successfully sent`
    }
})



setInterval(() => {
    console.log(`${sseClientManager.connectedClientsNumber()} Consumer/s connected like now; curentActiveTopics=${sseClientManager.getAllActiveTopics().join()}`);
}, 10 * 1000);



/* 
if (process.env.DEBUG_MODE == "yes") {
    setInterval(() => {
        console.log(`${sseClientManager.connectedClientsNumber()} Consumer/s connected like now; curentActiveTopics=${sseClientManager.getAllActiveTopics().join()}`);
    }, 1000);
    
    async function sendRandomToTopic():Promise<void> {
        console.log(`Trying to send random event to random topic`)
        await new Promise((resolve) => {
            setTimeout(resolve, +(Math.random() * 5000).toFixed())
        })
        const Topics = sseClientManager.getAllActiveTopics()
    
        if (!Topics.length) return sendRandomToTopic()
        const randomTopic = Topics[Math.floor(Math.random() * (Topics.length + 1))]
        sseClientManager.sendEvents(randomTopic, {
            time: new Date().toISOString(),
            msg: "Its ok!",
        },
            [randomTopic]
        )
    
        return sendRandomToTopic()
    
    }
    
    
    sendRandomToTopic()
    
}

*/


app.get('/consume', {
    schema: {
        querystring: {
            topic: { type: 'array' }
        }
    }

}, async (req, res) => {


    const topics = (req.query as {
        topic: string[]
    })?.topic

    if (!topics?.length) {
        res.send({
            success: false,
            msg: "Topics requird"
        })
    }

    //console.log(req)
    const headers = {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache'
    };
    res.raw.writeHead(200, headers);




    const clientId = sseClientManager.addNewClient({
        response: res,
        topics
    });


    res.raw.write(`ping:${JSON.stringify({ clientId, connected: true })}\n\n`)


    res.raw.on('close', () => {
        console.log(`Connection closed by client `)
        sseClientManager.deleteClient(clientId)
    })

})


// Run the server!
const runServer = async () => {
    try {

        await app.listen({ port })
        console.log(`server listen on port ${port}`)
    } catch (err) {
        app.log.error(err)
        process.exit(1)
    }
}
runServer()