import express from 'express'
import { engine } from "express-handlebars"
import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI();
const app = express()

app.engine('handlebars', engine())

app.set('view engine', 'handlebars')
app.set('views', './views')
app.use(express.urlencoded({ extended: true }))

let viewData = {
    sizes: [
        { value: '1024x1024', title: '1024x1024', selected: false},
        { value: '1024x1792', title: '1024x1792', selected: false},
        { value: '1792x1024', title: '1792x1024', selected: false}
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
        const response = await openai.images.generate({
            prompt,
            size,
            n: Number(number)
        })

        console.log(response.data)

        viewData.images = response.data
        res.render('index', viewData)
    } catch (e) {
        console.log(e)

        viewData.error = e.message
        res.render('index', viewData)
    }
})

app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}: http://localhost:${process.env.PORT}`))
