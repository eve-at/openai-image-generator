import express from 'express'
import config from 'config'
import { engine } from "express-handlebars"
import { Configuration, OpenAIApi } from 'openai'

const configuration = new Configuration({
    apiKey: config.get('OPENAI_API_KEY'),
});
const openai = new OpenAIApi(configuration);

const app = express()

app.engine('handlebars', engine())

app.set('view engine', 'handlebars')
app.set('views', './views')
app.use(express.urlencoded({ extended: true }))

let viewData = {
    sizes: [
        {value : '256x256', title: 'Small', selected: false},
        {value : '512x512', title: 'Medium', selected: false},
        {value : '1024x1024', title: 'Large', selected: false}
    ]
}

app.get('/', (req, res) => {
    viewData.sizes[0].selected = true
    res.render('index', viewData)
})

app.post('/', async (req, res) => {
    const prompt = req.body.prompt
    const size = req.body.size
    const number = req.body.number ?? 1

    viewData.prompt = prompt;
    viewData.size = size;
    viewData.number = number;

    viewData.sizes.map((defaultSize) => {
        defaultSize.selected = defaultSize.value === size
    })

    try {
        const response = await openai.createImage({
            prompt,
            size,
            n: Number(number)
        })

        console.log(response.data.data)

        viewData.images = response.data.data
        res.render('index', viewData)
    } catch (e) {
        viewData.error = e.message
        res.render('index', viewData)
    }
})

app.listen(3000, () => console.log("Server started ..."))
