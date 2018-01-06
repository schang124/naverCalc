class SizeUtil{
    static getViewportSize(){
        let x=0;
        let y=0;
        if (window.innerHeight) // all except Explorer < 9
        {
            x = window.innerWidth;
            y = window.innerHeight;
        }
        else if (document.documentElement && document.documentElement.clientHeight)
        // Explorer 6 Strict Mode
        {
            x = document.documentElement.clientWidth;
            y = document.documentElement.clientHeight;
        }
        else if (document.body) // other Explorers < 9
        {
            x = document.body.clientWidth;
            y = document.body.clientHeight;
        }

        return {
            width: x,
            height: y
        };
    }

    static getViewportWidth(){
        return this.getViewportSize().width;
    }

    static getViewportHeight(){
        return this.getViewportSize().height;
    }

    static getDOMSize(id){
        let x = 0;
        let y = 0;

        const t = document.getElementById(id);
        x = t.offsetWidth ? t.offsetWidth : t.clientWidth;
        y = t.offsetHeight ? t.offsetHeight : t.clientHeight;

        return {
            width: x,
            height: y
        };
    }

    static getDOMWidth(id){
        return SizeUtil.getDOMSize(id).width;
    }

    static getDOMHeight(id){
        return SizeUtil.getDOMSize(id).height;
    }
}

export default SizeUtil