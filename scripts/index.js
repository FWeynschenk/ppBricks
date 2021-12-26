import { createApp } from 'https://unpkg.com/petite-vue@0.2.2/dist/petite-vue.es.js'
import { loadString, setViewerSize } from './stlViewer.js'


createApp({
    // exposed to all expressions
    count: 0,
    // getters
    get plusOne() {
        return this.count + 1
    },
    model: undefined,


    // methods
    increment() {
        this.count++;
        fetch('http://bp508.hopto.org:3847')
            .then(response => response.json())
            .then(data => {
                loadString(data);
                this.model=data;
            }).catch(error => {
                console.log(error);
            })
    },
    downloadModel() {
        console.log("sadhjfg");
        const objectUrl = URL.createObjectURL(new Blob([this.model], { type: 'text/stl' }));
        const link = document.createElement('a');
        link.href = objectUrl;
        link.setAttribute('download', 'model.stl');
        document.body.appendChild(link);
        link.click();
    }

}).mount()