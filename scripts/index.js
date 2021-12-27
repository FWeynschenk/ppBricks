import { createApp } from 'https://unpkg.com/petite-vue@0.2.2/dist/petite-vue.es.js'
import { loadString, loadUrl, setViewerSize } from './stlViewer.js'


const vals = {};

createApp({
    // getters
    get plusOne() {
        return this.count + 1
    },
    model: undefined,
    // methods
    renderStl() {
        console.log(vals)
        fetch('https://bp508.hopto.org:3847', {
            method: 'POST',
            body: JSON.stringify(vals),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(data => {
                loadString(data);
                this.model = data;
            }).catch(error => {
                console.log(error);
            })

        console.log(vals);
    },
    downloadStl() {
        const objectUrl = URL.createObjectURL(new Blob([this.model], { type: 'text/stl' }));
        const link = document.createElement('a');
        link.href = objectUrl;
        link.setAttribute('download', 'model.stl');
        document.body.appendChild(link);
        link.click();
    },
    mounted() {
        loadUrl('./models/out9.stl');
        function setSTLViewerSize() {
            const container = document.getElementById('stlContainer');
            setViewerSize(container.clientWidth, container.clientHeight);
        }
        window.addEventListener('resize', setSTLViewerSize);
        setSTLViewerSize();
    },

    // inputs
    sliderInput,
    selectInput,
}).mount()


function sliderInput(props) {
    vals[props.name] = props.value;
    return {
        $template: '#slider-template',
        name: props.name,
        label: props.label,
        description: props.description,
        min: props.min,
        max: props.max,
        step: props.step,
        value: props.value,
        setVal() {
            vals[props.name] = parseInt(this.value);
        }
    }
}

function selectInput(props) {
    vals[props.name] = props.value;
    return {
        $template: '#select-template',
        name: props.name,
        label: props.label,
        description: props.description,
        options: props.options,
        value: props.value,
        setVal() {
            setTimeout(()=>{vals[props.name] = this.value;}, 100)
            
        }
    }
}

