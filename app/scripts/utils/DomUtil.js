class DomUtil{
    static addClass(element, className) {
        if(!this.hasClass(element)) {
            if(element.classList.length > 0){
                element.className += " " + className;
            } else  {
                element.className += className;
            }
        }
    }

    static removeClass(element, className){
        let check = new RegExp("(\\s|^)" + className + "(\\s|$)");
        if(element.className.indexOf(className) > -1) element.className = element.className.replace(check, " ").trim();
    }

    static toggleClass(element, className) {
        let check = new RegExp("(\\s|^)" + className + "(\\s|$)");

        if (check.test(element.className)){
            this.removeClass(element, className);
        } else {
            this.addClass(element, className);
        }
    }

    static hasClass(element, className){
        return element.className.indexOf(className) > -1;
    }
}

export default DomUtil