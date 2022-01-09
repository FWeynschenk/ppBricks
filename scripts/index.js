import { createApp, reactive } from 'https://unpkg.com/petite-vue@0.2.2/dist/petite-vue.es.js'
import { loadString, loadUrl, setViewerSize } from './stlViewer.js'

const vals = reactive(JSON.parse(localStorage.getItem('vals')) || {});

const buttonStates = {
    default: {
        id: 'default',
        text: "Render Model",
        disabled: false,
        icon: "bi bi-box-arrow-in-down-right fs-1"
    },
    loading: {
        id: 'loading',
        text: "Loading...",
        disabled: true,
        icon: "spinner-border"
    },
    queued: {
        id: 'queued',
        text: "Queued...",
        disabled: true,
        icon: "spinner-border"
    },
    failed: {
        id: 'failed',
        text: "Failed to render model",
        icon: "bi bi-exclamation-circle-fill fs-1"
    },
    download: {
        id: 'download',
        text: "Download STL",
        icon: "bi bi-cloud-arrow-down fs-1",
        disabled: false
    },
    warning: {
        id: 'warning',
        text: "Too many requests from this IP",
        icon: "bi bi-exclamation-circle fs-1",
        disabled: true,
    },
}

createApp({
    vals,
    buttonState: buttonStates.default,
    queuePlace: 0,
    modelName: '',
    model: undefined,

    // methods
    renderStl() {
        // TODO better name
        fetch('https://bp508.hopto.org:3847', {
            method: 'POST',
            body: JSON.stringify(vals),
            headers: { 'Content-Type': 'application/json' }
        })
            .then(response => response.json())
            .then(data => {
                if (data.queue) {
                    console.log('queue: ', data.queue);
                    this.buttonState = data.queue == 0 ? buttonStates.loading : buttonStates.queued;
                    this.queuePlace = data.queue;
                    setTimeout(renderStl, 5000);
                } else if (data.stl) {
                    console.log('stl: ', data.stl.length);
                    loadString(data.stl);
                    this.modelName = data.name;
                    this.model = data.stl;
                    this.buttonState = buttonStates.download;
                }
            }).catch(error => {
                console.log(error);
                this.buttonState = buttonStates.failed;
            });
    },
    downloadStl() {
        const objectUrl = URL.createObjectURL(new Blob([this.model], { type: 'text/stl' }));
        const link = document.createElement('a');
        link.href = objectUrl;
        link.setAttribute('download', `${this.modelName}.stl`);
        document.body.appendChild(link);
        link.click();
    },
    async mainBtnClick() {
        console.log(this.buttonState.id);
        switch (this.buttonState.id) {
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
            case 'download':
                this.downloadStl();
                break;
        }
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

        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
        const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl)
        })
    },

    // inputs
    sliderInput(props) {
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
                if (this.buttonState.id === 'download') {
                    this.buttonState = buttonStates.default;
                }
            }
        }
    },
    selectInput(props) {
        vals[props.name] = vals[props.name] || props.value;
        return {
            $template: '#select-template',
            name: props.name,
            label: props.label,
            description: props.description,
            options: props.options,
            value: vals[props.name] || props.value,
            setVal() {
                setTimeout(() => { vals[props.name] = this.value; }, 100);
                if (this.buttonState.id === 'download') {
                    this.buttonState = buttonStates.default;
                }
            }
        }
    }
}).mount()







