import 'babel-polyfill';
import Calculator from './modules/Calculator';

document.addEventListener('DOMContentLoaded', function(){
    // init
    let Calc = new Calculator('calc');
});

// disable two pinch zoom on iOS
document.addEventListener('touchmove', function (event) {
    if (event.scale !== 1) { event.preventDefault(); }
}, false);