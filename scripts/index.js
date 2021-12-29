import { createApp, reactive } from 'https://unpkg.com/petite-vue@0.2.2/dist/petite-vue.es.js'
import { loadString, loadUrl, setViewerSize } from './stlViewer.js'

const vals = reactive(JSON.parse(localStorage.getItem('vals')) || {});

const buttonStates = {
    default: {
        id: 'default',
        text: "Render Model",
        disabled: true,
    },
    loading: {
        id: 'loading',
        text: "Loading...",
        disabled: true,
    },
    failed: {
        id: 'failed',
        text: "Failed to render model",
    }
}

createApp({
    vals,
    buttonState: buttonStates.default,
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
                this.buttonState = buttonStates.default;
            }).catch(error => {
                console.log(error);
                this.buttonState = buttonStates.failed;
            });
    },
    downloadStl() {
        const objectUrl = URL.createObjectURL(new Blob([this.model], { type: 'text/stl' }));
        const link = document.createElement('a');
        link.href = objectUrl;
        link.setAttribute('download', 'model.stl');
        document.body.appendChild(link);
        link.click();
    },
    async mainBtnClick() {
        console.log("mainBtnClick");
        switch(this.buttonState.id) {
            case 'default':                
                this.buttonState = buttonStates.loading;
                this.renderStl();
                break;
            case 'loading':
                this.buttonState = buttonStates.failed;
                break;
            case 'failed':
                this.buttonState = buttonStates.default;
                break;
        }
        console.log(this.buttonState);

    },
    
    
    mounted() {
        window.onbeforeunload = () => {
            console.log("UNLOAD")
            localStorage.setItem('vals', JSON.stringify(vals));
        }
        loadUrl('./models/9089f7a330b6864ddde5b904dfa34b1125cc3ca0.stl');
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
    vals[props.name] = vals[props.name] || props.value;
    return {
        $template: '#slider-template',
        name: props.name,
        label: props.label,
        description: props.description,
        min: props.min,
        max: props.max,
        step: props.step,
        value: vals[props.name],
        parents: props.parents,
        setVal() {
            vals[props.name] = Number(this.value);
        }
    }
}

function selectInput(props) {
    vals[props.name] = vals[props.name] || props.value;
    return {
        $template: '#select-template',
        name: props.name,
        label: props.label,
        description: props.description,
        options: props.options,
        value: vals[props.name] || props.value,
        setVal() {
            setTimeout(() => { vals[props.name] = this.value; }, 100)

        }
    }
}


