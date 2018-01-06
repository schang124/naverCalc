import NumUtil from '../utils/NumUtil';
import DomUtil from '../utils/DomUtil';
import SizeUtil from '../utils/SizeUtil';
class Calculator {
    constructor(name) {
        this.form = document.getElementsByName(name)[0];
        this.firstInputFlag = true;
        this.totalFlag = false;
        this.formula = [];
        this.prevFormula=[];
        this.idx = 0;
        this.mobile = 768;

        this.click = this.click.bind(this);
        this.clean = this.clean.bind(this);
        this.total = this.total.bind(this);
        this.err = this.err.bind(this);

        this.addFormula = this.addFormula.bind(this);
        this.setIndexFormula = this.setIndexFormula.bind(this);
        this.setPrevFormula =this.setPrevFormula.bind(this);
        this.getIndexFormula = this.getIndexFormula.bind(this);

        this.processTotalFlag = this.processTotalFlag.bind(this);
        this.processSignPlusMinus= this.processSignPlusMinus.bind(this);
        this.processSignRest = this.processSignRest.bind(this);
        this.isValidInputDigits = this.isValidInputDigits.bind(this);
        this.isInitInput = this.isInitInput.bind(this);
        this.buildFormula = this.buildFormula.bind(this);

        this.bindClickEvent();  // click
        this.bindToggleEvent(); // toggle
        this.bindResize();      // position vertical middle

        this.toggle = this.toggle.bind(this);
    }

    click(e) {
        e && e.stopPropagation();
        const s = e.target.value;

        this.processTotalFlag(s);
        if(!this.isInitInput(s)) return; // set first input condition
        if(!this.buildFormula(s)) return; // check  & set sign for formula

        const commaFormula = this.formula.map((f)=>{ return NumUtil.addComma(f); });
        this.form.disp.value = commaFormula.join('');
    }

    clean() {
        this.firstInputFlag = true;
        this.totalFlag = false;
        this.formula = [];
        this.prevFormula = [];
        this.idx = 0;
        this.form.disp.value = 0;
    }

    total() {
        let r = 0;
        try {
            // eval
            if(this.formula.length > 1) {
                let prevInput = this.formula[this.idx -1];
                const lastInput = this.formula.pop();
                if(prevInput.length === 1 && isNaN(prevInput)) prevInput = this.formula.pop();
                else prevInput = '';

                this.setPrevFormula(prevInput + lastInput);
            }

            if(this.prevFormula.length === 0) return;

            const validFormula = NumUtil.removeComma( this.formula.concat(this.prevFormula).join('') ).replace(/×/g, '*').replace(/÷/g, '/');
            r = eval(validFormula);

            // decimals limit 5
            const decimals = r.toString().indexOf('.') > -1 ? r.toString().split('.')[1].length : 0;
            if (decimals > 5) r = parseFloat(parseFloat(r).toFixed(5)).toString();

            // NaN
            if (isNaN(r)) {
                this.err();
                return;
            }

        } catch (e) {
            this.err();
            return;
        }

        this.totalFlag = true;
        this.form.disp.value = NumUtil.addComma(r);
        this.idx = 0;
        this.formula = [];
        this.formula.push(r.toString());
    }

    err() {
        this.form.disp.value = 'Error';
        this.formula = [];
        this.firstInputFlag = true;
    }

    // getter & setter
    setIndexFormula(formula){
        this.formula[this.idx] = formula;
    }

    setPrevFormula(formula){
        this.prevFormula[0] = formula;
    }

    getIndexFormula(){
        return this.formula[this.idx];
    }

    addFormula(s){
        this.formula.push(s);
    }

    // bind
    bindClickEvent() {
        const buttons = document.getElementsByClassName('calc-btn')[0].getElementsByTagName('INPUT');

        let i = 0;
        while (i < buttons.length) {
            const b = buttons[i];
            if (b.value.toLowerCase() === 'c') b.addEventListener('click', this.clean);
            else if (b.value.toLowerCase() === '=') b.addEventListener('click', this.total);
            else b.addEventListener('click', this.click);
            i++;
        }
    }

    bindToggleEvent(){
        let i = 0;
        const close = document.getElementById('close');
        const minimize = document.getElementById('minimize');
        const toggle = document.getElementById('toggle');
        const buttons = [close, minimize, toggle];

        while (i < buttons.length) {
            const b = buttons[i];
            b.addEventListener('click', (e)=> this.toggle.call(this, e));
            i++;
        }
    }

    bindResize(){
        this.verticalMiddle();
        window.addEventListener('resize', ()=>this.verticalMiddle());
    }

    //fn
    processTotalFlag(s){
        if (this.totalFlag && ( !isNaN(s) || s === '.') ) {
            this.clean();
        } else {
            this.totalFlag = false;
        }
    }

    isValidInputDigits(){
        const formula = this.getIndexFormula();
        const length = formula ? NumUtil.removeComma(formula).toString().length : 0;
        if(length >= 10) return false;
        return true;
    }

    isInitInput(s){
        if (this.firstInputFlag) {
            if (parseInt(s, 10) === 0 || (isNaN(s) && s!== '.') ) return false;
            this.form.disp.value = '';
            this.firstInputFlag = false;
        }

        return true;
    }

    buildFormula(s){
        const saved = this.formula[this.idx] || '';
        const inputSign = isNaN(s);
        if(inputSign) {
            // decimal
            const inputDecimal = s === '.';
            const decimalNotAllowed = saved.indexOf('.') > -1;
            if(inputDecimal && decimalNotAllowed) return false;

            // sign
            const signPlusMinus = s.toString() === '±';
            if (signPlusMinus) {
                this.processSignPlusMinus(s);
            } else {
                this.processSignRest(s);
            }
        } else {
            if(!this.isValidInputDigits()) return false;
            this.setIndexFormula(saved + s);
        }
        console.log(this.formula);
        return true;
    }


    processSignPlusMinus(s){
        const validSaved = this.getIndexFormula() !== undefined;
        const prevSign = validSaved ? this.getIndexFormula().toString().substr(0, 1) : '';
        const validPrevSign = prevSign !== '' && isNaN(prevSign);
        const onlySign = validPrevSign && validSaved && this.getIndexFormula().length === 1;

        const prevSignMinus = prevSign === '-';
        const prevSignPlus = prevSign === '+';

        let newSign = '';
        const prevOnlySign = isNaN(this.formula[this.idx - 1]) && this.formula[this.idx - 1].length === 1
        if (prevSignMinus && (this.idx === 0 || prevOnlySign ) ) newSign = '';
        else if (prevSignMinus) newSign = '+';
        else if (prevSignPlus || validPrevSign) newSign = '-';
        else newSign = s;

        if (validPrevSign) {
            if(onlySign) return false;
            if (prevSignMinus || prevSignPlus) {
                this.setIndexFormula( newSign + this.formula[this.idx].substr(1) );
            } else {
                this.idx++;
                this.addFormula( newSign + this.formula[this.idx - 1].substr(1) );
                this.formula[this.idx - 1] = prevSign;
            }
        } else {
            this.setIndexFormula('-' + this.formula[this.idx]);
        }
    }

    processSignRest(s){
        const inputDecimal = s === '.';
        const saved = this.formula[this.idx] || '';
        const validSaved = this.getIndexFormula() !== undefined;
        const prevSign = validSaved ? this.getIndexFormula().toString().substr(0, 1) : '';
        const validPrevSign = prevSign !== '' && isNaN(prevSign);
        const onlySign = validPrevSign && validSaved && this.getIndexFormula().length === 1;

        if(onlySign) {
            if(inputDecimal) this.setIndexFormula(saved + 0 + s);
            else this.setIndexFormula(s);
        } else if(inputDecimal && !validSaved){
            this.setIndexFormula(saved + 0 + s);
        } else if(inputDecimal && validSaved){
            this.setIndexFormula(saved + s);
        } else {
            this.addFormula(s);
            this.idx++;
        }
    }

    // ui control
    toggle(e){
        e && e.preventDefault();
        e && e.stopPropagation();

        const hideClassName = 'display-hide';
        const calc = document.getElementById('calculator');
        const toggle = document.getElementById('toggle');

        DomUtil.toggleClass(calc, hideClassName);
        DomUtil.toggleClass(toggle, hideClassName);

        if(e.target.id === 'close') this.clean();

        if(DomUtil.hasClass(calc, hideClassName)){
            const top = SizeUtil.getViewportHeight() * 4 / 5;
            const left = SizeUtil.getViewportWidth() * 4 / 5;

            calc.style.top = top + 'px';
            calc.style.left = left * -1 + 'px';
            calc.style.transform = 'scale(0)';
        } else {
            calc.style.top = '0px';
            calc.style.left = '0px';
            calc.style.transform = 'scale(1)';
        }
    }

    verticalMiddle(){
        const vWidth = SizeUtil.getViewportWidth();
        const vHeight = SizeUtil.getViewportHeight();
        const calc = document.getElementById('calculator');
        const mobile = vWidth < this.mobile;

        const calcButton = document.getElementById('calcButton');
        const calcButtons = calcButton.getElementsByTagName('INPUT');

        if(mobile){
            calc.style.marginTop = '0px';

            // calcButton
            const calcTopHeight = SizeUtil.getDOMHeight('calcTop');
            const buttonHeight = (vHeight - calcTopHeight - 48) / 5;
            calcButton.style.height = vHeight - calcTopHeight + 'px';

            // calcButtons
            let i = 0;
            while (i < calcButtons.length) {
                calcButtons[i].style.height = (calcButtons[i].value.toString() === '=') ? buttonHeight * 2 + 8 + 'px' : buttonHeight + 'px';
                i++;
            }
        } else {
            const viewportHeight = SizeUtil.getViewportHeight();
            const height = SizeUtil.getDOMHeight('calculator');
            calc.style.marginTop = (viewportHeight - height) / 2 + 'px';

            // calcButton
            calcButton.style.height = null;

            // calcButtons
            let i = 0;
            while (i < calcButtons.length) {
                calcButtons[i].style.height = null;
                i++;
            }
        }
    }
}

export default Calculator